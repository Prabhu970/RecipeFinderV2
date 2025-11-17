import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from config import BASE_URL


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def chrome_options():
    options = Options()
    # Comment this out if you *don't* want headless
    # options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    return options


@pytest.fixture(scope="session")
def driver(chrome_options):
    """Session-scoped Chrome driver using Selenium Manager to resolve chromedriver."""
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 15)


def login_via_ui(driver, wait, base_url, email, password):
    """Helper to log in using the LoginForm."""
    driver.get(f"{base_url}/login")
    # Find email & password by label/placeholder
    email_input = wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='name@example.com']"))
    )
    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    email_input.clear()
    email_input.send_keys(email)
    password_input.clear()
    password_input.send_keys(password)
    # Click 'Sign in' button (text on LoginForm button)
    sign_in_btn = driver.find_element(By.XPATH, "//button[contains(., 'Sign in') or contains(., 'Sign In')]")
    sign_in_btn.click()
    # After login, we expect to land on home
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1.page-title")))
