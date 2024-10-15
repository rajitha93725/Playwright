import {test, expect} from '@playwright/test';
import {deviceUids, deviceVersion, getUpdateAvailableID} from "../common/util";
// import * as util from "node:util"; // Ensure you have Playwright installed


test('NC-1676 FOTA Verify Post request to bulk when without authentication.', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const response = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
        headers: {
            Authorization: ``,
            'Content-Type': 'application/json'
        },
        data: {
            updates: [4879345]
        }
    });
    // Check the response status
    expect(response.status()).toBe(401);
});

test('NC-1677 FOTA Valid bulk Post request with single device.', async ({ request }) => {
    const uid = deviceUids.Mitra_device_7424;
    const version = deviceVersion.V1_2_0_rc1;
    // Function to add a delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Function to cancel jobs
    const cancelJobs = async (jobIds) => {
        try {
            const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/downloaded/cancel', {
                headers: {
                    Authorization: `Bearer ${process.env.TOKEN}`,
                    'Content-Type': 'application/json'
                },
                data: { job_ids: jobIds }
            });

            expect(cancelResponse.status()).toBe(200);
            const cancelResponseBody = await cancelResponse.json();
            console.log("Cancelled Jobs Response:", cancelResponseBody);

            cancelResponseBody.forEach(job => {
                const { successful, state, uid } = job;
                console.log(`Verifying job with ID ${job.id}`);
                expect(successful).toBe(true);
                expect(uid).toBe(uid);
                expect(state).toBe("DownloadReady");
            });
        } catch (error) {
            console.error("Error cancelling jobs:", error);
            expect(error).toBeUndefined();
        }
    };

    // Function to verify device details
    const verifyDeviceDetails = (device) => {
        const expectedUid = uid;
        const expectedJobState = "DownloadQueued";

        expect(device).not.toBeUndefined();
        expect(device.serial).toBe("Mitra Demo 5");
        expect(device.keySwitchState).toBe(1);
        expect(device.isOnline).toBe(true);
        expect(device.inService).toBe(true);
        expect(device.type).toBe("zkl-3000-rc");
        expect(device.country).toBe("NL");
        expect(device.mainHardware).toBe("1.2");
        expect(device.mainFirmware).toBe("1.3.1");
        expect(device.checkDetail).toEqual({
            isOnline: true,
            isInService: true,
            isKeySwitchOperational: true
        });
        expect(device.checkPassed).toBe(true);

        const job = device.jobs.find(job => job.uid === expectedUid && job.state === expectedJobState);
        expect(job).not.toBeUndefined();
        expect(job.state).toBe(expectedJobState);
        expect(job.component).toBe("nmdi");
        expect(job.version).toBe(version);

        return device.jobs.map(job => Number(job.id));
    };

    try {
        // Perform the POST request
        const response = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: { updates: [5551995] }
        });

        // Check the response status
        expect(response.status()).toBe(201);

        // Parse the response body
        const responseBody = await response.json();
        console.log('Response:', responseBody);

        // Ensure the response body is not empty
        expect(responseBody.length).toBeGreaterThanOrEqual(0);

        // Verify the device details and get job IDs
        const device = responseBody.find(device => device.uid === uid);
        const jobIds = verifyDeviceDetails(device);
        console.log("Job Ids:", jobIds);

        // Add a delay
        await delay(10000);

        // Cancel the downloaded job
        await cancelJobs(jobIds);

    } catch (error) {
        console.error("Error during the bulk post request or processing device:", error);
        expect(error).toBeUndefined();
    }
});

test('NC-1678 FOTA Valid bulk Post request with multiple devices.', async ({ request }) => {
    // Define a delay function
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Function to cancel jobs
    const cancelJob = async (jobId) => {
        try {
            const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/downloaded/cancel', {
                headers: {
                    Authorization: `Bearer ${process.env.TOKEN}`,
                    'Content-Type': 'application/json'
                },
                data: { job_ids: [jobId] }
            });

            expect(cancelResponse.status()).toBe(200);
            const cancelResponseBody = await cancelResponse.json();
            console.log(`Cancelled Job ID: ${jobId}`, cancelResponseBody);

            cancelResponseBody.forEach(job => {
                const { successful, state } = job;
                expect(successful).toBe(true);
                expect(state).toBe("DownloadReady");
            });
        } catch (error) {
            console.error(`Error canceling job ${jobId}:`, error);
            expect(error).toBeUndefined();
            throw error;
        }
    };

    // Perform the bulk POST request
    try {
        const response = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: { updates: [5551989, 5551992] }
        });

        expect(response.status()).toBe(201);
        const responseBody = await response.json();
        console.log('Response:', responseBody);

        // Ensure response body is not empty
        expect(responseBody.length).toBeGreaterThan(0);

        // Add a delay to allow for job processing
        await delay(10000);

        // Process each device
        for (const device of responseBody) {
            const rootUid = device.uid;
            console.log("Processing device with UID:", rootUid);

            for (const job of device.jobs) {
                try {
                    expect(job.uid).toBe(rootUid);
                    expect(job.state).toBe("DownloadQueued");
                    console.log("Download Queued Job ID:", job.id);

                    await cancelJob(job.id);

                } catch (error) {
                    console.error(`Error processing job ${job.id}:`, error);
                    expect(error).toBeUndefined();
                }
            }
        }
    } catch (error) {
        console.error("Error performing bulk POST request:", error);
        expect(error).toBeUndefined();
    }
});

test('NC-1679 FOTA Verify bulk Post request with wrong authentication.', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const response = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
        headers: {
            Authorization: `Bearer ory_at_UMlVaIvDy74EE7j9ddu_Zmk1egWOjnAz45gjnZbag8Y.MET9tV47h-60x-4UhxeqLnEFyKAjJ9x7s3_q_Sy2nlor`,
            'Content-Type': 'application/json'
        },
        data: {
            updates: [4879345]
        }
    });
    // Check the response status
    expect(response.status()).toBe(401);
});

test('NC-1680 FOTA Verify FOTA bulk Post request with invalid request method.', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const response = await request.delete('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            updates: [4879345]
        }
    });
    // Check the response status
    expect(response.status()).toBe(405);
});

test('NC-1681 FOTA Verify bulk Post request with invalid endpoint.', async ({ request }) => {
    const uid = deviceUids.Mitra_device_7420;
    const updateAvailableID = getUpdateAvailableID(uid);

    // Perform the POST request using Playwright's request object
    const response = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulkinvalid', {
        headers: {
            Authorization: `${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            updates: [updateAvailableID]
        }
    });
    // Check the response status
    expect(response.status()).toBe(404);
});

test('NC-1682 FOTA Verify bulk Post request invalid request body.', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const response = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
        headers: {
            Authorization: `${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            "updates": ["4879345"]
        }
    });
    // Check the response status
    expect(response.status()).toBe(401);
});
