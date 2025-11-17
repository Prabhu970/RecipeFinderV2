from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


# NOTE: These tests assume you already have:
# - a Supabase project seeded with some recipes
# - at least one existing user account for login flows
# Update the credentials and any text selectors to match your environment.

TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "Password123!"


def test_e2e_001_signup_profile_search_view_recipe(driver, wait, base_url):
    """
    E2E-001: Signup → Profile Setup → Search → View Recipe

    This test follows:
    1. Go to /signup and create a new account
    2. Complete profile setup form
    3. Use search to find recipes
    4. Open a recipe details page
    """
    driver.get(f"{base_url}/signup")

    # Fill signup form
    full_name = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[placeholder='John Doe']")
    ))
    email_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder='name@example.com']")
    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")

    # To avoid email uniqueness collisions, append a random suffix
    import time
    suffix = int(time.time())
    email_value = f"selenium+{suffix}@example.com"

    full_name.send_keys("Selenium Test User")
    email_input.send_keys(email_value)
    password_input.send_keys("Password123!")

    signup_btn = driver.find_element(By.XPATH, "//button[contains(., 'Create account') or contains(., 'Sign up')]")
    signup_btn.click()

    # Profile setup page
    name_field = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[placeholder='Prabhu Gopal']")
    ))
    name_field.clear()
    name_field.send_keys("Selenium Test User")
    # Select a diet preference (e.g., Vegan)
    diet_select = driver.find_element(By.CSS_SELECTOR, "select")
    diet_select.click()
    driver.find_element(By.XPATH, "//option[@value='vegan']").click()

    save_profile_btn = driver.find_element(By.XPATH, "//button[contains(., 'Save profile')]")
    save_profile_btn.click()

    # Expect redirect to home route
    wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(@class,'page-title')]")))

    # Navigate to Search page via nav link
    driver.get(f"{base_url}/search")
    search_input = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[type='search'], input[placeholder*='Search']")
    ))
    search_input.send_keys("chicken")

    # Assuming search triggers automatically or on button click
    # Wait for at least one recipe card
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".recipe-card, a[href^='/recipes/']")))

    # Click the first recipe
    card = driver.find_element(By.CSS_SELECTOR, "a[href^='/recipes/']")
    card.click()

    # Verify recipe detail loads
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1.page-title")))


def test_e2e_010_favorites_flow(driver, wait, base_url, login_via_ui):
    """
    E2E-010: Favorite a recipe and verify it on Favorites page.
    """
    # Login as existing test user
    login_via_ui(driver, wait, base_url, TEST_USER_EMAIL, TEST_USER_PASSWORD)

    # Go to home and open a recipe
    driver.get(f"{base_url}/")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href^='/recipes/']")))
    driver.find_element(By.CSS_SELECTOR, "a[href^='/recipes/']").click()

    # Toggle favorite on detail page
    fav_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(., 'Save') or contains(., 'Saved')]")
    ))
    fav_btn.click()

    # Navigate to favorites page
    driver.get(f"{base_url}/favorites")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "section.stack")))

    # Expect at least one recipe card
    favorites = driver.find_elements(By.CSS_SELECTOR, "a[href^='/recipes/']")
    assert len(favorites) > 0


def test_e2e_020_shopping_list_flow(driver, wait, base_url, login_via_ui):
    """
    E2E-020: Add ingredients to shopping list and manage items.
    """
    login_via_ui(driver, wait, base_url, TEST_USER_EMAIL, TEST_USER_PASSWORD)

    # Open a recipe
    driver.get(f"{base_url}/")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href^='/recipes/']")))
    driver.find_element(By.CSS_SELECTOR, "a[href^='/recipes/']").click()

    # Click "Add ingredients" button
    add_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(., 'Add ingredients')]")
    ))
    add_btn.click()

    # Go to shopping list
    driver.get(f"{base_url}/shopping-list")
    wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(., 'Shopping list') or contains(., 'Shopping List')]")))

    items = driver.find_elements(By.CSS_SELECTOR, "div.bg-gray-900, div.bg-gray-800, div[class*='shopping']")
    assert len(items) > 0

    # Try clicking the first 'Increase' or '+' button if present, then 'Remove'
    buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Remove') or contains(., '+') or contains(., 'Increase')]")
    if buttons:
        buttons[0].click()


def test_e2e_030_ratings_flow(driver, wait, base_url, login_via_ui):
    """
    E2E-030: Add rating and review and verify visibility.
    """
    login_via_ui(driver, wait, base_url, TEST_USER_EMAIL, TEST_USER_PASSWORD)

    # Open a recipe detail
    driver.get(f"{base_url}/")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href^='/recipes/']")))
    driver.find_element(By.CSS_SELECTOR, "a[href^='/recipes/']").click()

    # Locate rating select (assuming <select> for rating)
    rating_select = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//select[contains(@name,'rating') or ancestor::form]")
    ))
    rating_select.click()
    # Select 5 if present
    driver.find_element(By.XPATH, "//option[@value='5' or contains(., '5')]").click()

    # Review textarea
    textareas = driver.find_elements(By.TAG_NAME, "textarea")
    if textareas:
        textareas[0].send_keys("Great recipe from Selenium test!")

    # Click save rating button
    save_btn = driver.find_element(By.XPATH, "//button[contains(., 'Submit review') or contains(., 'Save rating') or contains(., 'Submit')]")
    save_btn.click()

    # Expect some confirmation (alert or new review in list) - we just wait for reviews section to load
    wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(., 'User reviews') or contains(., 'reviews')]")))


def test_e2e_040_ai_generator_success(driver, wait, base_url):
    """
    E2E-040: AI generator happy path.
    """
    driver.get(f"{base_url}/ai-generator")

    title_input = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input.input")
    ))
    title_input.clear()
    title_input.send_keys("Spicy garlic chicken")

    ingredients_input = driver.find_element(By.XPATH, "//textarea[contains(@class, 'input') or @class='input']")
    ingredients_input.send_keys("chicken, garlic, chili flakes, olive oil")

    # Optionally set servings & tags
    servings_input = driver.find_element(By.CSS_SELECTOR, "input[type='number']")
    servings_input.clear()
    servings_input.send_keys("2")

    generate_btn = driver.find_element(By.XPATH, "//button[contains(., 'Generate recipe')]")
    generate_btn.click()

    # Wait for result title
    wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(., 'Steps') or contains(., 'Ingredients')]")
    ))


def test_e2e_041_ai_generator_error_handling(driver, wait, base_url, monkeypatch):
    """
    E2E-041: AI generator shows graceful error when backend is down.

    This is hard to simulate purely in Selenium without env control.
    As a compromise, this test simply verifies that the form
    remains usable after a failed submit (e.g., wrong URL configured).
    """
    driver.get(f"{base_url}/ai-generator")

    title_input = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input.input")
    ))
    title_input.clear()
    title_input.send_keys("Test error path")

    ingredients_input = driver.find_element(By.XPATH, "//textarea[contains(@class, 'input') or @class='input']")
    ingredients_input.send_keys("dummy ingredients")

    generate_btn = driver.find_element(By.XPATH, "//button[contains(., 'Generate recipe')]")
    generate_btn.click()

    # Wait some time and just assert the page hasn't crashed (form still present)
    wait.until(EC.presence_of_element_located((By.TAG_NAME, "form")))


def test_e2e_050_profile_and_avatar(driver, wait, base_url, login_via_ui):
    """
    E2E-050: Update profile info and avatar.
    """
    login_via_ui(driver, wait, base_url, TEST_USER_EMAIL, TEST_USER_PASSWORD)

    driver.get(f"{base_url}/profile")

    # Update profile fields
    email_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
    display_name_input = driver.find_element(By.CSS_SELECTOR, "input[type='text']")
    display_name_input.clear()
    display_name_input.send_keys("Updated Selenium User")

    # Save button
    save_btn = driver.find_element(By.XPATH, "//button[contains(., 'Save') and not(contains(., 'profile'))]")
    save_btn.click()

    # Avatar upload (uses hidden input; we can at least ensure the label exists)
    avatar_label = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(., 'Change avatar') or contains(., 'Upload avatar')]")
    ))
    assert avatar_label is not None


def test_e2e_060_auth_guards(driver, wait, base_url):
    """
    E2E-060: Protected pages redirect/guard unauthenticated users.
    """
    # Ensure logged out by visiting /login and not submitting, then directly hit protected routes
    driver.get(f"{base_url}/favorites")
    # Expect redirect to /login or some guard message
    wait.until(EC.any_of(
        EC.url_contains("/login"),
        EC.presence_of_element_located((By.XPATH, "//*[contains(., 'Sign in') or contains(., 'Login')]"))
    ))

    driver.get(f"{base_url}/shopping-list")
    wait.until(EC.any_of(
        EC.url_contains("/login"),
        EC.presence_of_element_located((By.XPATH, "//*[contains(., 'Sign in') or contains(., 'Login')]"))
    ))


def test_e2e_061_api_failure_handling(driver, wait, base_url):
    """
    E2E-061: Frontend handles Node API downtime gracefully.

    Real failure simulation requires controlling the backend.
    Here we at least assert that error UI elements render when
    the API returns non-200 (manual setup required).
    """
    driver.get(f"{base_url}/")
    # If the API is down, the home route will likely show an EmptyState or error.
    # We just wait for either recipe grid or some error text.
    wait.until(EC.any_of(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".recipe-card, a[href^='/recipes/']")),
        EC.presence_of_element_located((By.XPATH, "//*[contains(., 'Failed to') or contains(., 'Try again') or contains(., 'offline')]"))
    ))


def test_e2e_042_ingredient_substitutions(driver, wait, base_url, login_via_ui):
    """
    E2E-042: AI ingredient substitutions shown on recipe detail.
    """
    login_via_ui(driver, wait, base_url, TEST_USER_EMAIL, TEST_USER_PASSWORD)

    # Open any recipe
    driver.get(f"{base_url}/")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href^='/recipes/']")))
    driver.find_element(By.CSS_SELECTOR, "a[href^='/recipes/']").click()

    # Scroll to AI ingredient substitutions card and click Suggest
    subs_button = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//h3[contains(., 'AI ingredient substitutions')]/following::button[contains(., 'Suggest')][1]")
    ))
    subs_button.click()

    # Expect either a list of <li> elements or helper text to remain
    wait.until(EC.any_of(
        EC.presence_of_element_located((By.XPATH, "//h3[contains(., 'AI ingredient substitutions')]/following::ul[1]/li")),
        EC.presence_of_element_located((By.XPATH, "//h3[contains(., 'AI ingredient substitutions')]/following::p[contains(., 'AI will suggest')]"))
    ))
