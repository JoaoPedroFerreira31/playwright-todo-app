import { Page, Locator } from '@playwright/test';
import type { Priority } from '../src/types';

export class TodoPage {
  readonly page: Page;
  readonly title: Locator;
  readonly priority: Locator;
  readonly dueDate: Locator
  readonly todoItem: Locator;
  readonly todoTitle: Locator;
  readonly addButton: Locator

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('new-todo-input');
    this.priority = page.getByTestId('new-todo-priority');
    this.dueDate = page.getByTestId('new-todo-due-date');
    this.todoItem = page.getByTestId('todo-item');
    this.todoTitle = page.getByTestId('todo-title');
    this.addButton = page.getByTestId('add-todo-button');
  }

  async goto() {
    await this.page.goto('/');
  }

  async createTodo(name: string, priority: Priority, dueDate: string | null) {
    await this.title.fill(name);
    await this.priority.selectOption(priority);
    if (dueDate) {
      await this.dueDate.fill(dueDate);
    }
    await this.addButton.click();
  }
}