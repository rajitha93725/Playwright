import { test, expect } from '@playwright/test';

test('NC-2840 FOTA GET request to the jobs endpoint with valid bearer token.', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(200);
});

test('NC-2841 FOTA GET request with different page and per_page parameters within valid range.', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 2,
                per_page: 20
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(200);

    const json = await get.json();

    // Verify there are exactly 10 uid entries
    const uidCount = json.length;
    console.log(`Number of UID entries: ${uidCount}`);
    expect(uidCount).toEqual(20);

    // Optionally, log each UID for verification
    json.forEach((data: any, index: number) => {
        console.log(`Device ${index + 1} UID: ${data.uid}`);
    });
});

test('NC-2842 FOTA Multiple GET requests to paginate through all available FOTA jobs.', async ({ request }) => {
    const getResponse1 = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(getResponse1.status()).toEqual(200);

    const json1 = await getResponse1.json();
    // console.log(json1);

    const getResponse2 = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 2,
                per_page: 10
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(getResponse2.status()).toEqual(200);

    const json2 = await getResponse2.json();
    // console.log(json2);

    // Extracting UID values from the JSON responses
    const firstUidSet = new Set(json1.map((device: { uid: any; }) => device.uid));
    const secondUidSet = new Set(json2.map((device: { uid: any; }) => device.uid));

    // Checking for common UIDs
    const commonUids = [firstUidSet].filter(uid => secondUidSet.has(uid));

    // Logging the results
    if (commonUids.length === 0) {
        console.log("Success: No common UID found between the two sets.");
    } else {
        console.error(`Failure: Common UID(s) found: ${commonUids.join(', ')}`);
    }

    // Assertion to verify no common UIDs
    if (commonUids.length > 0) {
        throw new Error(`Test failed: Common UID(s) found: ${commonUids.join(', ')}`);
    } else {
        console.log("Test passed: No common UIDs found.");
    }
    expect(commonUids.length).toEqual(0);
});

test('NC-2843 FOTA jobs GET request with maximum per_page parameter value.', async ({ request }) => {
    const getResponse1 = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 201
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(getResponse1.status()).toEqual(400);

    const getResponse2 = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 199
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(getResponse2.status()).toEqual(200);

    const json2 = await getResponse2.json();

    // Verify there are exactly 10 uid entries
    const uidCount2 = json2.length;
    console.log(`Number of UID entries: ${uidCount2}`);
    expect(uidCount2).toEqual(199);

    const getResponse3 = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 200
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(getResponse3.status()).toEqual(200);

    const json3 = await getResponse3.json();

    // Verify there are exactly 10 uid entries
    const uidCount3 = json3.length;
    console.log(`Number of UID entries: ${uidCount3}`);
    expect(uidCount3).toEqual(200);
});

test('NC-2844 FOTA jobs GET request without providing a bearer token.', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10
            }, headers:
                { Authorization: `` }
        })
    expect(get.status()).toEqual(401);
});

test('NC-2845 FOTA jobs GET request with an invalid or expired bearer token.', async ({ request }) => {
    const invalidBearer = 'ory_at_CMwK6X9IMJyyPUcVEeYB1YyUip7Dd4AVLYybD53QIwY.eRvlQIcGCCq-XgWfb3YHX0Nfl_OZO1ia7qKbS6nVQSY';
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10
            }, headers:
                { Authorization: `Bearer ${invalidBearer}` }
        })
    expect(get.status()).toEqual(401);
});

test('NC-2846 FOTA jobs GET request with an invalid page parameter.', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: -1,
                per_page: 10
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(400);
});

test('NC-2847 FOTA jobs GET request with an invalid per_page parameter.', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: -10
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(400);
});

test('NC-2848 FOTA jobs GET request with invalid query parameters.', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10,
                sort: -1,
                sort_dir: 'asdc'
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(400);
});

test('NC-2849 FOTA jobs GET request to a non-existent endpoint.', async ({ request }) => {
    const get = await request.get("/api/fota/jobs_non_exist?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(404);
});

test('NC-2850 FOTA jobs Verify that the response contains the expected fields.', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10,
                search: '100fc133742100000000000000000010'
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(200);

    const json = await get.json();

    function checkJsonData(data: any): {
        containsId: boolean; containsCreated_at: boolean; containsCreated_by: boolean; containsUid: boolean; containsState: boolean;
        containsUpdated_at: boolean; containsFirmwarePath: boolean; containsSerial: boolean; containsLabel: boolean; containsIs_online: boolean;
        containsVersion: boolean; containsError_code: boolean
    } {
        const containsId = 'id' in data;
        const containsCreated_at = 'created_at' in data;
        const containsCreated_by = 'created_by' in data;
        const containsUid = 'uid' in data;
        const containsState = 'state' in data;
        const containsUpdated_at = 'updated_at' in data;
        const containsFirmwarePath = 'FirmwarePath' in data;
        const containsSerial = 'serial' in data;
        const containsLabel = 'label' in data;
        const containsIs_online = 'is_online' in data;
        const containsVersion = 'version' in data;
        const containsError_code = 'error_code' in data;

        return {
            containsId, containsCreated_at, containsCreated_by, containsUid, containsState, containsUpdated_at, containsFirmwarePath,
            containsSerial,containsLabel, containsIs_online, containsVersion, containsError_code
        };
    }

    // Call the function with the sample JSON data
    const { containsId, containsCreated_at, containsCreated_by, containsUid, containsState, containsUpdated_at, containsFirmwarePath,
        containsSerial, containsIs_online, containsVersion, containsError_code } = checkJsonData(json[0]);

    // Assertion for function
    expect(containsId).toBeTruthy();
    expect(containsCreated_at).toBeTruthy();
    expect(containsCreated_by).toBeTruthy();
    expect(containsUid).toBeTruthy();
    expect(containsState).toBeTruthy();
    expect(containsUpdated_at).toBeTruthy();
    expect(containsFirmwarePath).toBeTruthy();
    expect(containsSerial).toBeTruthy();
    expect(containsIs_online).toBeTruthy();
    expect(containsVersion).toBeTruthy();
    expect(containsError_code).toBeTruthy();

    // Print the results
    console.log(`Contains 'id': ${containsId}`);
    console.log(`Contains 'created_at': ${containsCreated_at}`);
    console.log(`Contains 'created_by': ${containsCreated_by}`);
    console.log(`Contains 'uid': ${containsUid}`);
    console.log(`Contains 'state': ${containsState}`);
    console.log(`Contains 'updated_at': ${containsUpdated_at}`);
    console.log(`Contains 'FirmwarePath': ${containsFirmwarePath}`);
    console.log(`Contains 'label': ${containsSerial}`);
    console.log(`Contains 'is_online': ${containsIs_online}`);
    console.log(`Contains 'version': ${containsVersion}`);
    console.log(`Contains 'error_code': ${containsError_code}`);
});

test('NC-3437 FOTA Get request Jobs Json field types verification', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10,
                search: '100fc133742100000000000000000010'
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(200);

    const json = await get.json();

    function checkJsonData(data: any): {
        isIdNumber: boolean;
        isCreated_atDateTime: boolean;
        isCreated_byString: boolean;
        isUidString: boolean;
        isStateString: boolean;
        isDeviceUpdated_atString: boolean;
        isFirmwarePathString: boolean;
        isSerialString: boolean;
        isLabelString: boolean;
        isIsOnlineBoolean: boolean;
        isVersionsString: boolean;
        isErrorCodeString: boolean;

    } {
        const isIdNumber = !isNaN(Number(data.id));
        const isCreated_atDateTime = !isNaN(new Date(data.created_at).getTime());
        const isCreated_byString = typeof data.created_by === 'string';
        const isUidString = typeof data.uid === 'string';
        const isStateString = typeof data.state === 'string';
        const isDeviceUpdated_atString = !isNaN(new Date(data.updated_at).getTime());
        const isFirmwarePathString = typeof data.FirmwarePath === 'string';
        const isSerialString = typeof data.serial === 'string';
        const isLabelString = typeof data.label === 'string';
        const isIsOnlineBoolean = typeof data.is_online === 'boolean';
        const isVersionsString = typeof data.version === 'string';
        const isErrorCodeString = typeof data.error_code === 'string';

        return {
            isIdNumber,
            isCreated_atDateTime,
            isCreated_byString,
            isUidString,
            isStateString,
            isDeviceUpdated_atString,
            isFirmwarePathString,
            isSerialString,
            isLabelString,
            isIsOnlineBoolean,
            isVersionsString,
            isErrorCodeString
        };
    }

    // Call the function with the sample JSON data
    const { isIdNumber,
        isCreated_atDateTime,
        isCreated_byString,
        isUidString,
        isStateString,
        isDeviceUpdated_atString,
        isFirmwarePathString,
        isSerialString,
        isLabelString,
        isIsOnlineBoolean,
        isVersionsString,
        isErrorCodeString } = checkJsonData(json[0]);

    // Assertion for function
    expect(isIdNumber).toBeTruthy();
    expect(isCreated_atDateTime).toBeTruthy();
    expect(isCreated_byString).toBeTruthy();
    expect(isUidString).toBeTruthy();
    expect(isStateString).toBeTruthy();
    expect(isDeviceUpdated_atString).toBeTruthy();
    expect(isFirmwarePathString).toBeTruthy();
    expect(isSerialString).toBeTruthy();
    expect(isLabelString).toBeTruthy();
    expect(isIsOnlineBoolean).toBeTruthy();
    expect(isVersionsString).toBeTruthy();
    expect(isErrorCodeString).toBeTruthy();

    // Print the results
    console.log(`ID is number: ${isIdNumber}`);
    console.log(`Created_at is date: ${isCreated_atDateTime}`);
    console.log(`Created_by is string: ${isCreated_byString}`);
    console.log(`Uid is string: ${isUidString}`);
    console.log(`State is string: ${isStateString}`);
    console.log(`Updated_at is date: ${isDeviceUpdated_atString}`);
    console.log(`FirmwarePath is string: ${isFirmwarePathString}`);
    console.log(`Serial is boolean: ${isSerialString}`);
    console.log(`Label Reason is string: ${isLabelString}`);
    console.log(`Is_online are boolean: ${isIsOnlineBoolean}`);
    console.log(`version are string: ${isVersionsString}`);
    console.log(`Error_code is string: ${isErrorCodeString}`);
});

test('NC-3438 FOTA Verify GET Jobs can be sorted by serial number', async ({ request }) => {
    const getResponse1 = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 10,
                sort: 'serial',
                sort_dir: 'asc'
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(getResponse1.status()).toEqual(200);

    // Parse the JSON response from the first request
    const json1 = await getResponse1.json();
    console.log('Uid of the first item in the first response array:', json1[0].uid);

    const getResponse2 = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=desc",
        {
            params: {
                page: 1,
                per_page: 10,
                sort: 'serial',
                sort_dir: 'desc'
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(getResponse2.status()).toEqual(200);

    // Parse the JSON response from the second request
    const json2 = await getResponse2.json();
    console.log('Uid of the first item in the first response array:', json2[0].uid);

    // Verify that the `uid` values from the first items in the response arrays are not the same
    const uid1 = json1[0]?.uid;
    const uid2 = json2[0]?.uid;
    console.log('Are uids different:', uid1 !== uid2);
    expect(uid1).not.toEqual(uid2);
});

test('NC-3439 FOTA Get request to Jobs with when device is in Online', async ({ request }) => {
    const get = await request.get("/api/fota/jobs?page=1&per_page=10&sort=serial&sort_dir=asc",
        {
            params: {
                page: 1,
                per_page: 1,
                sort_dir: 'asc',
                search: '100fc133742200000000000000000010'
            }, headers:
                { Authorization: `Bearer ${process.env.TOKEN}` }
        })
    expect(get.status()).toEqual(200);

    const json = await get.json();
    console.log(json);

    // Iterate over each device in the response
    json.forEach((data: any, index: number) => {
        // Verify if the UID matches the expected value
        console.log(`Device ${index + 1}:`);

        // Print the results
        console.log(`ID is number: ${data.id}`);
        console.log(`Created_at is date: ${data.created_at}`);
        console.log(`Created_by is string: ${data.created_by}`);
        console.log(`Uid is string: ${data.uid}`);
        console.log(`State is string: ${data.state}`);
        console.log(`Updated_at is date: ${data.updated_at}`);
        console.log(`FirmwarePath is string: ${data.FirmwarePath}`);
        console.log(`Serial is boolean: ${data.serial}`);
        console.log(`Label Reason is string: ${data.label}`);
        console.log(`Is_online are boolean: ${data.is_online}`);
        console.log(`version are string: ${data.version}`);
        console.log(`Error_code is string: ${data.error_code}`);

        expect(data.id).toEqual(1378);
        expect(data.created_by).toEqual('Super User');
        expect(data.uid).toEqual('100fc133742200000000000000000010');
        expect(data.state).toEqual('Cancel');
        expect(data.FirmwarePath).toEqual('');
        expect(data.serial).toEqual('Mitra Demo 3');
        expect(data.label).toEqual('');
        expect(data.is_online).toBeTruthy();
        expect(data.version).toEqual('1.2.0-rc.1');
        expect(data.error_code).toEqual('');
    });
});



