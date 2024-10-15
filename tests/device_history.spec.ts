import {expect, test} from "@playwright/test";

test('NC-3727 FOTA Verify Get request successfully retrieve the device history', async ({ request }) => {
    const uid = '100fc133742200000000000000000010';
    const get = await request.get(`/api/fota/device/${uid}/history`,
    {
            headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(200);

    const json = await get.json();

    // Verify the JSON structure
    json.forEach((entry: any) => {
        expect(entry).toHaveProperty('previousFirmwareVersion');
        expect(entry).toHaveProperty('currentFirmwareVersion');
        expect(entry).toHaveProperty('updatedBy');
        expect(entry).toHaveProperty('firmwareType');
        expect(entry).toHaveProperty('updatedTime');
        expect(entry).toHaveProperty('status');
    });
});

test('NC-3728 FOTA Verify Get device history request when invalid endpoint', async ({ request }) => {
    const uid = '100fc133742200000000000000000010';
    const get = await request.get(`/api/fota/device/${uid}/historyinvalidEndPoint`,
        {
            headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(404);
});

test('NC-3729 FOTA Verify Get device history request when empty authorization', async ({ request }) => {
    const uid = '100fc133742200000000000000000010';
    const get = await request.get(`/api/fota/device/${uid}/history`,
        {
            headers:
                { Authorization: `` }
        })
    expect(get.status()).toEqual(401);
});

test('NC-3730 FOTA Verify Get device history request when invalid authorization', async ({ request }) => {
    const invalidBearer = 'ory_at_CMwK6X9IMJyyPUcVEeYB1YyUip7Dd4AVLYybD53QIwY.eRvlQIcGCCq-XgWfb3YHX0Nfl_OZO1ia7qKbS6nVQSY';
    const uid = '100fc133742200000000000000000010';
    const get = await request.get(`/api/fota/device/${uid}/history`,
        {
            headers:
                { Authorization: `${invalidBearer}` }
        })
    expect(get.status()).toEqual(401);
});

test('NC-3731 FOTA Verify Get device history request when invalid method', async ({ request }) => {
    const uid = '100fc133742200000000000000000010';
    const get = await request.post(`/api/fota/device/${uid}/history`,
        {
            headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(405);
});