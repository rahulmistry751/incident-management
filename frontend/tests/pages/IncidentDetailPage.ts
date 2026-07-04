import { Page, Locator, expect } from '@playwright/test';

export class IncidentDetailPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly statusSelect: Locator;
  readonly updateSuccessMsg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.statusSelect = page.locator('#status-select-detail');
    this.updateSuccessMsg = page.locator('text=Updated!');
  }

  async updateStatus(status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
    await this.statusSelect.selectOption(status);
  }

  async verifyTimelineEvent(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }
}
