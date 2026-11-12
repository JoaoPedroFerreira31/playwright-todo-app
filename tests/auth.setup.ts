import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { createUserData } from '../factories/userFactory';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {  
    const user = createUserData();    

    const registerRes = await page.request.post('/api/auth/register', {
        data: { name: user.name, email: user.email, password: user.password },
    });

    await expect(registerRes).toBeOK();

    const loginRes = await page.request.post('/api/auth/login', {
        data: { email: user.email, password: user.password },
    });

    await expect(loginRes).toBeOK();

    await page.context().storageState({ path: authFile });
});