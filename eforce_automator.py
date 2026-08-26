#!/usr/bin/env python3
"""
eforce_automator.py
Author: Nico Rubino
Description: Automates downloading PDMP reports from state prescription monitoring program.
Version: 4.2 — Selenium-based, batch processes patient lists, renames reports by patient name.

Usage:
  Set environment variables PMP_USER and PMP_PASS with your credentials,
  or edit the CONFIGURATION section below. Place a patient-list PDF in INPUT/
  and run. Reports land in OUTPUT/<date>/ renamed as LastName,FirstName.pdf.
"""

import os
import sys
import time
import logging
import datetime
import glob
import shutil

import fitz  # PyMuPDF
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# --- CONFIGURATION (edit before use) ---
BASE_PATH = r"./Eforce Automation"
INPUT_FOLDER = os.path.join(BASE_PATH, "INPUT")
OUTPUT_FOLDER = os.path.join(BASE_PATH, "E-force complete")

LOGIN_URL = "https://<state>.pmpaware.net/login"
REVIEW_REQUESTS_URL = "https://<state>.pmpaware.net/rx_search_requests"
SUPERVISOR_NAME = "<supervisor name>"

# --- LOGGING ---
def setup_logging(log_path):
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[logging.FileHandler(log_path), logging.StreamHandler(sys.stdout)]
    )

# --- PDF EXTRACTION ---
def extract_patient_data_from_pdf(pdf_path):
    """Extract patient names and DOBs from PDF, converting 2-digit years."""
    patients = []
    logging.info(f"Reading patient data from: {pdf_path}")
    current_yy = int(datetime.datetime.now().strftime("%y"))
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text = page.get_text("text")
                lines = text.split('\n')
                for i, line in enumerate(lines):
                    if ',' in line and i + 1 < len(lines):
                        next_line = lines[i+1].strip()
                        if '/' in next_line and len(next_line) > 5:
                            name_parts = line.split(',')
                            last_name = name_parts[0].strip()
                            first_name = name_parts[1].strip()
                            dob_parts = next_line.split('/')
                            if len(dob_parts) == 3 and len(dob_parts[2]) == 2:
                                year_yy = int(dob_parts[2])
                                full_year = 1900 + year_yy if year_yy > current_yy else 2000 + year_yy
                                dob = f"{dob_parts[0]}/{dob_parts[1]}/{full_year}"
                            else:
                                dob = next_line
                            patients.append({"first": first_name, "last": last_name, "dob": dob})
                            logging.info(f"  > Found: {last_name}, {first_name} ({dob})")
    except Exception as e:
        logging.error(f"Failed to read PDF: {e}")
        return None
    return patients

# --- FILE RENAMING ---
def process_and_rename_files(folder_path):
    """Rename downloaded RxReport*.pdf files to LastName,FirstName.pdf."""
    logging.info("--- Renaming Files ---")
    for pdf_path in glob.glob(os.path.join(folder_path, "RxReport*.pdf")):
        try:
            doc = fitz.open(pdf_path)
            text = doc[0].get_text("text")
            doc.close()
            first_line = text.split('\n')[0]
            name_str = first_line.split('|')[0].strip()
            name_parts = name_str.split()
            new_name = f"{name_parts[-1]},{name_parts[0]}.pdf"
            new_path = os.path.join(folder_path, new_name)
            if os.path.exists(new_path):
                os.remove(pdf_path)
                logging.info(f"Duplicate '{new_name}' — removed {os.path.basename(pdf_path)}")
            else:
                shutil.move(pdf_path, new_path)
                logging.info(f"Renamed → {new_name}")
        except Exception as e:
            logging.error(f"Rename failed for {pdf_path}: {e}")

# --- RECOVERY PASS ---
def recover_failed_reports(driver, wait, failed_patients, dashboard_url):
    """Retry failed patients via the review requests page."""
    if not failed_patients:
        return
    logging.info("--- Recovery Pass ---")
    for patient in failed_patients:
        logging.info(f"Retrying: {patient['last']}, {patient['first']}")
        try:
            driver.get(REVIEW_REQUESTS_URL)
            page = 1
            found = False
            while not found:
                time.sleep(2)
                try:
                    row = wait.until(EC.presence_of_element_located(
                        (By.XPATH, f"//tr[contains(., \"{patient['last']}\") and contains(., \"{patient['first']}\")]")))
                    row.click()
                    wait.until(EC.element_to_be_clickable((By.ID, "view_request_button"))).click()
                    export = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "vs-report__menu-link--export")))
                    export.click()
                    time.sleep(1)
                    wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Download PDF"))).click()
                    time.sleep(3)
                    found = True
                except (NoSuchElementException, TimeoutException):
                    try:
                        driver.find_element(By.LINK_TEXT, "Next ›").click()
                        page += 1
                    except NoSuchElementException:
                        logging.warning(f"Not found in review history: {patient['last']}")
                        break
        except Exception as e:
            logging.error(f"Recovery failed for {patient['last']}: {e}")

# --- MAIN ---
def main():
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    todays_output = os.path.join(OUTPUT_FOLDER, today)
    os.makedirs(todays_output, exist_ok=True)
    setup_logging(os.path.join(BASE_PATH, "automation_log.txt"))
    logging.info("--- E-FORCE Automation Started ---")

    pmp_username = os.getenv("PMP_USER")
    pmp_password = os.getenv("PMP_PASS")
    if not pmp_username or not pmp_password:
        logging.error("Set PMP_USER and PMP_PASS environment variables.")
        return

    input_files = glob.glob(os.path.join(INPUT_FOLDER, "*.pdf"))
    if len(input_files) != 1:
        logging.error(f"Expected 1 input PDF, found {len(input_files)}")
        return

    patients = extract_patient_data_from_pdf(input_files[0])
    if not patients:
        return

    chrome_opts = Options()
    prefs = {"download.default_directory": todays_output}
    chrome_opts.add_experimental_option("prefs", prefs)
    service = ChromeService()  # chromedriver must be on PATH
    driver = webdriver.Chrome(service=service, options=chrome_opts)
    wait = WebDriverWait(driver, 20)
    failed = []

    try:
        driver.get(LOGIN_URL)
        wait.until(EC.element_to_be_clickable((By.ID, "auth_key"))).send_keys(pmp_username)
        driver.find_element(By.ID, "password").send_keys(pmp_password)
        driver.find_element(By.NAME, "commit").click()
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'My Dashboard')]")))
        logging.info("Login OK")
        dashboard_url = driver.current_url
        time.sleep(2)

        for patient in patients:
            logging.info(f"--- {patient['last']}, {patient['first']} ---")
            try:
                driver.get(dashboard_url)
                wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'My Dashboard')]")))
                wait.until(EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Menu']"))).click()
                time.sleep(1)
                wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Patient Request"))).click()
                wait.until(EC.element_to_be_clickable((By.ID, "rx_search_request_first_name"))).send_keys(patient['first'])
                driver.find_element(By.ID, "rx_search_request_last_name").send_keys(patient['last'])
                driver.find_element(By.ID, "rx_search_request_birthdate").send_keys(patient['dob'])
                Select(driver.find_element(By.ID, "rx_search_request_delegator_id")).select_by_visible_text(SUPERVISOR_NAME)
                driver.find_element(By.XPATH, "//input[@value='Search']").click()
                try:
                    export = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "vs-report__menu-link--export")))
                    export.click()
                    time.sleep(1)
                    wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Download PDF"))).click()
                    time.sleep(3)
                except TimeoutException:
                    failed.append(patient)
            except Exception as e:
                driver.save_screenshot(os.path.join(todays_output, f"ERROR_{patient['last']}_{patient['first']}.png"))
                logging.error(f"Error: {e}")
                failed.append(patient)

        recover_failed_reports(driver, wait, failed, dashboard_url)
    finally:
        driver.quit()
        logging.info("Browser closed")

    process_and_rename_files(todays_output)
    logging.info("--- Done ---")

if __name__ == "__main__":
    main()