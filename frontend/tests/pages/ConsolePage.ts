import { Page, Locator, expect } from '@playwright/test';
import { IncidentSeverity, IncidentStatus } from '@/types/incident';

export class ConsolePage {
  readonly page: Page;
  readonly sidebarDashboardBtn: Locator;
  readonly sidebarListBtn: Locator;
  readonly sidebarCreateBtn: Locator;
  readonly pageHeading: Locator;

  // Create Form fields
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly registerBtn: Locator;
  readonly successHeading: Locator;
  readonly viewDashboardBtn: Locator;

  // List fields
  readonly searchInput: Locator;
  readonly tableRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebarDashboardBtn = page.getByRole('button', { name: 'Dashboard' });
    this.sidebarListBtn = page.getByRole('button', { name: 'Incidents List' });
    this.sidebarCreateBtn = page.getByRole('button', { name: 'Create Incident' });
    this.pageHeading = page.locator('h2');

    // Create form selectors
    this.titleInput = page.getByLabel('Incident Title *');
    this.descriptionInput = page.getByLabel('Description *');
    this.registerBtn = page.getByRole('button', { name: 'Register Incident' });
    this.successHeading = page.locator('text=Incident Registered Successfully');
    this.viewDashboardBtn = page.getByRole('button', { name: 'View Dashboard' });

    // List selectors
    this.searchInput = page.getByPlaceholder('Search incident title, description, or ID…');
    this.tableRows = page.locator('table tbody tr');
  }

  async goto() {
    await this.page.goto('/');
  }

  async navigateToTab(tab: 'Dashboard' | 'Incidents List' | 'Create Incident') {
    if (tab === 'Dashboard') {
      await this.sidebarDashboardBtn.click();
    } else if (tab === 'Incidents List') {
      await this.sidebarListBtn.click();
    } else if (tab === 'Create Incident') {
      await this.sidebarCreateBtn.click();
    }
  }

  async submitCreateForm(
    title: string,
    description: string,
    severity: IncidentSeverity,
    status: IncidentStatus
  ) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);

    // Select severity
    const sevLabel = severity.charAt(0) + severity.slice(1).toLowerCase();
    await this.page.getByRole('radio', { name: sevLabel }).click();

    // Select status
    let statusLabel = 'Open';
    if (status === 'IN_PROGRESS') statusLabel = 'In Progress';
    if (status === 'RESOLVED') statusLabel = 'Resolved';
    await this.page.getByRole('radio', { name: statusLabel }).click();

    await this.registerBtn.click();
  }

  async searchAndOpenIncident(title: string) {
    await this.searchInput.fill(title);
    const firstRow = this.tableRows.first();
    await expect(firstRow).toContainText(title);
    await firstRow.click();
  }
}
