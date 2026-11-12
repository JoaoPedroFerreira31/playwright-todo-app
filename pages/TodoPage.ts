import { Page, Locator } from '@playwright/test';

export class TodoPage {
  readonly page: Page;
  readonly title: Locator;
  readonly priority: Locator;
  readonly dueDate: Locator
  readonly addButton: Locator

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('new-todo-input');
    this.priority = page.getByTestId('new-todo-priority');
    this.dueDate = page.getByTestId('new-todo-due-date');
    this.addButton = page.getByTestId('add-todo-button');
  }

  async goto() {
    await this.page.goto('/');
  }

  async createTodo(name: string, priority: string, dueDate: string) {
    await this.title.fill(name);
    await this.priority.selectOption(priority);
    await this.dueDate.fill(dueDate);
    await this.addButton.click();
  }
}