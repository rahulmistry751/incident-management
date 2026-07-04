import { test as base } from '@playwright/test';
import { ConsolePage } from './pages/ConsolePage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';

type PageObjects = {
  consolePage: ConsolePage;
  detailPage: IncidentDetailPage;
};

export const test = base.extend<PageObjects>({
  consolePage: async ({ page }, use) => {
    const consolePage = new ConsolePage(page);
    await use(consolePage);
  },
  detailPage: async ({ page }, use) => {
    const detailPage = new IncidentDetailPage(page);
    await use(detailPage);
  },
});

export { expect } from '@playwright/test';
