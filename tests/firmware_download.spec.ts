import {expect, test} from "@playwright/test";

test('NC-XXXX FOTA Verify Get request firmware download', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const get = await request.get('api/fota/firmware/download/ENCRYPTED-nmdi-app_service-iot_dualinventive_com_4080_1.2.0-rc.1.bin',
    {
        params: {
            id: 1632,
            exp: '1720162646',
            sig: 'lpUmuI0OLaKe7pDrLahAqauVo1c='
        }
    })
    expect(get.status()).toEqual(200);
});

test('NC-XXXX FOTA Verify Get request firmware download with missing required param', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const get = await request.get('api/fota/firmware/download/ENCRYPTED-nmdi-app_service-iot_dualinventive_com_4080_1.2.0-rc.1.bin',
        {
            params: {
                exp: '1720162646',
                sig: 'lpUmuI0OLaKe7pDrLahAqauVo1c='
            }
        })
    expect(get.status()).toEqual(400);
});

test('NC-XXXX FOTA Verify Get request firmware download with expiration time has passed', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const get = await request.get('api/fota/firmware/download/ENCRYPTED-nmdi-app_service-iot_dualinventive_com_4080_1.2.0-rc.1.bin',
        {
            params: {
                id: 1632,
                exp: '1717564074',
                sig: 'lpUmuI0OLaKe7pDrLahAqauVo1c='
            }
        })
    expect(get.status()).toEqual(401);
});

test('NC-XXXX FOTA Verify Get request firmware download with signature verification failed', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const get = await request.get('api/fota/firmware/download/ENCRYPTED-nmdi-app_service-iot_dualinventive_com_4080_1.2.0-rc.1.bin',
        {
            params: {
                id: 1632,
                exp: '1720162646',
                sig: 'lpUmuI0OLaKe7pDrLahAqauVo1c=F'
            }
        })
    expect(get.status()).toEqual(403);
});

test('NC-XXXX FOTA Verify Get request firmware download with firmware file not found', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const get = await request.get('api/wrongpath/fota/firmware/download/nonexistent-file.bin',
        {
            params: {
                id: 1632,
                exp: '1720162646',
                sig: 'lpUmuI0OLaKe7pDrLahAqauVo1c=F'
            }
        })
    expect(get.status()).toEqual(404);
});
