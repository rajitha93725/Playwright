import { test, expect } from '@playwright/test';
import {deviceUids, deviceVersion} from "../common/util";

test('NC-1746 FOTA Get request to available_updates with valid bearer token', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
    {
      params: {
        page: 1,
        per_page: 10
      }, headers:
        { Authorization: `Bearer ${process.env.TOKEN}` }
    })
  expect(get.status()).toEqual(200);
});

test('NC-3431 FOTA GET request with different page and per_page parameters within valid range.', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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

test('NC-3432 FOTA Multiple GET requests to paginate through all available FOTA jobs.', async ({ request }) => {
  const getResponse1 = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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

  const getResponse2 = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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

test('NC-3433 FOTA jobs GET request with maximum per_page parameter value.', async ({ request }) => {
  const getResponse1 = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
      {
        params: {
          page: 1,
          per_page: 201
        }, headers:
            { Authorization: `Bearer ${process.env.TOKEN}` }
      })
  expect(getResponse1.status()).toEqual(400);

  const getResponse2 = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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

  const getResponse3 = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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

test('NC-3434 FOTA jobs GET request without providing a bearer token.', async ({ request }) => {
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

test('NC-1747 FOTA Get request to available_updates with invalid or expired bearer token', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
    {
      params: {
        page: 1,
        per_page: 10
      }, headers:
        { Authorization: `Bearer Invalid` }
    })
  expect(get.status()).toEqual(401);
});

test('NC-1748 FOTA Get request to available_updates with invalid page', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
    {
      params: {
        page: -1,
        per_page: 10
      }, headers:
        { Authorization: `Bearer ${process.env.TOKEN}` }
    })
  expect(get.status()).toEqual(400);
});

test('NC-1749 FOTA Get request to available_updates with invalid per_page', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
    {
      params: {
        page: 1,
        per_page: -10
      }, headers:
        { Authorization: `Bearer ${process.env.TOKEN}` }
    })
  expect(get.status()).toEqual(400);
});

test('NC-3435 FOTA jobs GET request with invalid query parameters.', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
      {
        params: {
          page: 1,
          per_page: 10,
          search: -1,
          sort_dir: -1
        }, headers:
            { Authorization: `Bearer ${process.env.TOKEN}` }
      })
  expect(get.status()).toEqual(400);
});

test('NC-3436 FOTA jobs GET request to a non-existent endpoint.', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates_non_exist?page=1&per_page=10&sort=serial&sort_dir=asc",
      {
        params: {
          page: 1,
          per_page: 10
        }, headers:
            { Authorization: `Bearer ${process.env.TOKEN}` }
      })
  expect(get.status()).toEqual(404);
});

test('NC-1750 FOTA Get request to available_updates contains expected fields', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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
    containsUid: boolean; containsSerial: boolean; containsLabel: boolean; containsIsOnline: boolean; containsInService: boolean;
    containsDeviceType: boolean; containsCountry: boolean; containsId: boolean; containsVersion: boolean; containsType: boolean;
    containsSelectable: boolean; containsOuterSelectable: boolean
  } {
    const containsUid = 'uid' in data;
    const containsSerial = 'serial' in data;
    const containsLabel = 'label' in data;
    const containsIsOnline = 'isOnline' in data;
    const containsInService = 'inService' in data;
    const containsDeviceType = 'deviceType' in data;
    const containsCountry = 'country' in data;
    const containsOuterSelectable = 'selectable' in data;

    const containsId = data.availableUpdates?.some((update: any) => 'id' in update);
    const containsVersion = data.availableUpdates?.some((update: any) => 'version' in update);
    const containsType = data.availableUpdates?.some((update: any) => 'type' in update);
    const containsSelectable = data.availableUpdates?.some((update: any) => 'selectable' in update);
    return {
      containsUid, containsSerial, containsLabel, containsIsOnline, containsInService, containsDeviceType, containsCountry,
      containsId, containsVersion, containsType, containsSelectable, containsOuterSelectable
    };
  }

  // Call the function with the sample JSON data
  const { containsUid, containsSerial, containsLabel, containsIsOnline, containsInService, containsDeviceType, containsCountry,
    containsId, containsVersion, containsType, containsSelectable, containsOuterSelectable } = checkJsonData(json[0]);

  // Assertion for function
  expect(containsUid).toBeTruthy();
  expect(containsSerial).toBeTruthy();
  expect(containsLabel).toBeTruthy();
  expect(containsIsOnline).toBeTruthy();
  expect(containsInService).toBeTruthy();
  expect(containsDeviceType).toBeTruthy();
  expect(containsCountry).toBeTruthy();
  expect(containsId).toBeTruthy();
  expect(containsVersion).toBeTruthy();
  expect(containsType).toBeTruthy();
  expect(containsSelectable).toBeTruthy();
  expect(containsOuterSelectable).toBeTruthy();

  // Print the results
  console.log(`Contains 'uid': ${containsUid}`);
  console.log(`Contains 'serial': ${containsSerial}`);
  console.log(`Contains 'label': ${containsLabel}`);
  console.log(`Contains 'isOnline': ${containsIsOnline}`);
  console.log(`Contains 'inService': ${containsInService}`);
  console.log(`Contains 'deviceType': ${containsDeviceType}`);
  console.log(`Contains 'country': ${containsCountry}`);
  console.log(`Contains 'id' in available updates: ${containsId}`);
  console.log(`Contains 'version' in available updates: ${containsVersion}`);
  console.log(`Contains 'type' in available updates: ${containsType}`);
  console.log(`Contains 'selectable' in available updates: ${containsSelectable}`);
  console.log(`Contains 'selectable': ${containsOuterSelectable}`);
});

test('NC-3362 FOTA Get request available_updates Json field types verification', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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
    isUidString: boolean;
    isSerialString: boolean;
    isLabelString: boolean;
    isIsOnlineBoolean: boolean;
    isInServiceBoolean: boolean;
    isDeviceTypeString: boolean;
    isCountryString: boolean;
    areIdsNumeric: boolean;
    areVersionsString: boolean;
    areTypeString: boolean;
    areSelectableBoolean: boolean;
    isSelectableBoolean: boolean;
    isSelectableReasonString: boolean;

  } {
    const isUidString = typeof data.uid === 'string';
    const isSerialString = typeof data.serial === 'string';
    const isLabelString = typeof data.label === 'string';
    const isIsOnlineBoolean = typeof data.isOnline === 'boolean';
    const isInServiceBoolean = typeof data.inService === 'boolean';
    const isDeviceTypeString = typeof data.deviceType === 'string';
    const isCountryString = typeof data.country === 'string';
    const areIdsNumeric = data.availableUpdates?.every((update) => !isNaN(Number(update.id))) ?? false;
    const areVersionsString = data.availableUpdates?.every((update) => typeof update.version === 'string') ?? false;
    const areTypeString = data.availableUpdates?.every((update) => typeof update.type === 'string') ?? false;
    const areSelectableBoolean = data.availableUpdates?.every((update) => typeof update.selectable === 'boolean') ?? false;
    const isSelectableBoolean = typeof data.selectable === 'boolean';
    const isSelectableReasonString = typeof data.selectableReason === 'string';

    return {
      isUidString,
      isSerialString,
      isLabelString,
      isIsOnlineBoolean,
      isInServiceBoolean,
      isDeviceTypeString,
      isCountryString,
      areIdsNumeric,
      areVersionsString,
      areTypeString,
      areSelectableBoolean,
      isSelectableBoolean,
      isSelectableReasonString
    };
  }

  // Call the function with the sample JSON data
  const { isUidString,
    isSerialString,
    isLabelString,
    isIsOnlineBoolean,
    isInServiceBoolean,
    isDeviceTypeString,
    isCountryString,
    areIdsNumeric,
    areVersionsString,
    areTypeString,
    areSelectableBoolean,
    isSelectableBoolean,
    isSelectableReasonString } = checkJsonData(json[0]);

    // Assertion for function
    expect(isUidString).toBeTruthy();
    expect(isSerialString).toBeTruthy();
    expect(isLabelString).toBeTruthy();
    expect(isIsOnlineBoolean).toBeTruthy();
    expect(isInServiceBoolean).toBeTruthy();
    expect(isDeviceTypeString).toBeTruthy();
    expect(isCountryString).toBeTruthy();
    expect(areIdsNumeric).toBeTruthy();
    expect(areVersionsString).toBeTruthy();
    expect(areTypeString).toBeTruthy();
    expect(areSelectableBoolean).toBeTruthy();
    expect(isSelectableBoolean).toBeTruthy();
    expect(isSelectableReasonString).toBeTruthy();

  // Print the results
  console.log(`UID is string: ${isUidString}`);
  console.log(`Serial is string: ${isSerialString}`);
  console.log(`Label is string: ${isLabelString}`);
  console.log(`IsOnline is boolean: ${isIsOnlineBoolean}`);
  console.log(`InService is boolean: ${isInServiceBoolean}`);
  console.log(`DeviceType is string: ${isDeviceTypeString}`);
  console.log(`Country is string: ${isCountryString}`);
  console.log(`Selectable is boolean: ${isSelectableBoolean}`);
  console.log(`Selectable Reason is string: ${isSelectableReasonString}`);
  console.log(`IDs are numeric: ${areIdsNumeric}`);
  console.log(`Versions are string: ${areVersionsString}`);
  console.log(`Type is string: ${areTypeString}`);
  console.log(`Selectable in available updates is boolean: ${areSelectableBoolean}`);
});

test('NC-1751 FOTA available_update Get request selectable reason only included when device cannot be selected', async ({ request }) => {
  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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

  type JsonData = {
    selectableReason?: string;
    selectable?: boolean;
  };

  // Verify the JSON data
  json.forEach((data: JsonData, index: number) => {
    const isSelectableReasonCorrect = data.selectableReason === 'DEVICE_OFFLINE';
    const isSelectableCorrect = data.selectable === false;

    console.log(`Data ${index + 1}:`);
    console.log(`Selectable reason is 'DEVICE_OFFLINE': ${isSelectableReasonCorrect}`);
    console.log(`Selectable is false: ${isSelectableCorrect}`);

    // Assert the conditions
    expect(isSelectableReasonCorrect).toBeTruthy();
    expect(isSelectableCorrect).toBeTruthy();
  })
});

test('NC-1752 FOTA Verify GET available_update can be sorted by serial number', async ({ request }) => {
  const getResponse1 = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
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

  const getResponse2 = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=desc",
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

test('NC-3414 FOTA Get request to available_updates with when device is in Online', async ({ request }) => {
  const uid = deviceUids.Mitra_device_7422;
  const version1 = deviceVersion.V1_2_0_rc1;
  const version2 = deviceVersion.V1_2_0_rc2;

  const get = await request.get("/api/fota/available_updates?page=1&per_page=10&sort=serial&sort_dir=asc",
      {
        params: {
          page: 1,
          per_page: 10,
          search: uid
        }, headers:
            { Authorization: `Bearer ${process.env.TOKEN}` }
      })
  expect(get.status()).toEqual(200);

  const json = await get.json();

  // Define the interface for the JSON data structure
  interface JsonData {
    uid: string;
    serial: string;
    label: string;
    isOnline: boolean;
    inService: boolean;
    deviceType: string;
    country: string;
    availableUpdates: Update[];
    selectable: boolean;
  }

  interface Update {
    id: string;
    version: string;
    type: string;
    selectable: boolean;
  }

  // Iterate over each device in the response
  json.forEach((data: JsonData, index: number) => {
    // Verify if the UID matches the expected value
    console.log(`Device ${index + 1}:`);

    console.log(`UID: ${data.uid}`);
    console.log(`Serial: ${data.serial}`);
    console.log(`Is Online: ${data.isOnline}`);
    console.log(`In Service: ${data.inService}`);
    console.log(`Device Type: ${data.deviceType}`);
    console.log(`Country: ${data.country}`);
    console.log(`Selectable: ${data.selectable}`);

    expect(data.uid).toEqual('100fc133742200000000000000000010');
    expect(data.serial).toEqual('Mitra Demo 3');
    expect(data.isOnline).toBeTruthy();
    expect(data.inService).toBeTruthy();
    expect(data.deviceType).toEqual('zkl-3000-rc');
    expect(data.country).toEqual('NL');

    // Iterate over the available updates
    data.availableUpdates.forEach((update, updateIndex) => {
      // Log update details
      console.log(`Update ${updateIndex + 1}:`);
      console.log(`ID: ${update.id}`);
      console.log(`Version: ${update.version}`);
      console.log(`Type: ${update.type}`);
      console.log(`Selectable: ${update.selectable}`);

      // Define expected updates for comparison
      const expectedUpdates = [
        {
          id: 5551989,
          version: version1,
          type: 'nmdi',
          selectable: true
        },
        {
          id: 6126357,
          version: version2,
          type: 'nmdi',
          selectable: true
        }
      ];
      // Find the expected update based on the updateIndex
      const expectedUpdate = expectedUpdates[updateIndex];

      if (expectedUpdate) {
        // Verify the update details match the expected values
        expect(update.id).toEqual(expectedUpdate.id);
        expect(update.version).toEqual(expectedUpdate.version);
        expect(update.type).toEqual(expectedUpdate.type);
        expect(update.selectable).toBe(expectedUpdate.selectable);
      } else {
        // Log an error if there is no expected update for the current index
        console.error(`No expected update found for index ${updateIndex}`);
      }
    });
  });
});


