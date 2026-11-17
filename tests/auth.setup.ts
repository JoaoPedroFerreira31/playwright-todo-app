// EXEMPLO DE REFERÊNCIA — não é usado pela suite.
// Mostra o padrão "setup project + storageState": fazer login uma vez e
// reutilizar a sessão em todos os testes. Aqui não compensa porque o registo
// pela API é barato e queremos um utilizador por teste (isolamento).
// Para ativar, ver o bloco comentado em playwright.config.ts.

import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { createUserData } from '@org/pw-fixtures';

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