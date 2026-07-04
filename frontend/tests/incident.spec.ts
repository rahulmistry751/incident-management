import { test, expect } from './fixtures';

test.describe('Incident Management E2E Flow (POM)', () => {
  test.beforeEach(async ({ consolePage }) => {
    // Navigate to the main application page
    await consolePage.goto();
  });

  test('should navigate between different tabs in the console', async ({ consolePage }) => {
    // 1. Dashboard Tab should load by default
    await expect(consolePage.pageHeading).toContainText('dashboard Console');
    await expect(
      consolePage.page.getByRole('heading', { name: 'Severity Distribution' })
    ).toBeVisible();
    await expect(
      consolePage.page.getByRole('heading', { name: 'Status Distribution' })
    ).toBeVisible();

    // 2. Navigate to "Incidents List"
    await consolePage.navigateToTab('Incidents List');
    await expect(consolePage.pageHeading).toContainText('list Console');
    await expect(consolePage.searchInput).toBeVisible();

    // 3. Navigate to "Create Incident"
    await consolePage.navigateToTab('Create Incident');
    await expect(consolePage.pageHeading).toContainText('Register Incident');
    await expect(consolePage.titleInput).toBeVisible();
  });

  test('should validate intake form inputs before submission', async ({ consolePage }) => {
    // Navigate to Create Incident tab
    await consolePage.navigateToTab('Create Incident');

    // Click submit without entering any details
    await consolePage.registerBtn.click();

    // Assert that validation errors are displayed correctly
    await expect(consolePage.page.locator('text=Title is required')).toBeVisible();
    await expect(consolePage.page.locator('text=Description is required')).toBeVisible();
  });

  test('should register an incident, search for it, view details, and update status', async ({
    consolePage,
    detailPage,
  }) => {
    const uniqueTitle = `E2E POM Auth Service Error - ${Date.now()}`;
    const description = `Autotest description: Redis connection timeout on server cluster shard-4. Code error: 504 gateway timeout.`;

    // 1. Navigate to intake form
    await consolePage.navigateToTab('Create Incident');

    // 2. Submit Create Incident Form
    await consolePage.submitCreateForm(uniqueTitle, description, 'CRITICAL', 'IN_PROGRESS');

    // 3. Verify registration success screen is displayed
    await expect(consolePage.successHeading).toBeVisible();

    // 4. Click View Dashboard
    await consolePage.viewDashboardBtn.click();
    await expect(consolePage.pageHeading).toContainText('dashboard Console');

    // 5. Go to Incident List tab and search for our unique title
    await consolePage.navigateToTab('Incidents List');
    await consolePage.searchAndOpenIncident(uniqueTitle);

    // 6. Verify we are navigated to the detail page
    await consolePage.page.waitForURL(/\/incident\/.+/);
    await expect(detailPage.heading).toContainText(uniqueTitle);

    // 7. Verify status select has the initial status and then modify it to RESOLVED
    await expect(detailPage.statusSelect).toHaveValue('IN_PROGRESS');
    await detailPage.updateStatus('RESOLVED');

    // 8. Confirm update notification is shown
    await expect(detailPage.updateSuccessMsg).toBeVisible();

    // 9. Verify status changed to Resolved and the timeline contains the operator update event
    await expect(detailPage.statusSelect).toHaveValue('RESOLVED');
    await detailPage.verifyTimelineEvent('Status updated manually to "RESOLVED".');
  });
});
