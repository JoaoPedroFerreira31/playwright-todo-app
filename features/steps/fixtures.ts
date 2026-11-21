import { mergeTests } from '@playwright/test';
import { createBdd, test as bddTest } from 'playwright-bdd';
import { createUserData, type UserData } from '@org/pw-fixtures';
import { test as projectTest, expect } from '../../fixtures/index';

const base = mergeTests(bddTest, projectTest);

type BddFixtures = {  
  registeredUser: UserData;
};

export const test = base.extend<BddFixtures>({
  
  registeredUser: async ({ request }, use) => {
    const user = createUserData();
    
    await expect(await request.post('/api/auth/register', { data: user })).toBeOK();
    
    await use(user);
  },

});


export const { Given, When, Then } = createBdd(test);
export { expect };
