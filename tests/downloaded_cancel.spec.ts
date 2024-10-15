import {expect, test} from "@playwright/test";

test('NC-3486 FOTA Verify Post request cancel the created job when without authentication.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/downloaded/cancel', {
        headers: {
            Authorization: ``,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [924]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(401);
});

test('NC-3487 FOTA Verify Post request cancel the created job when with wrong authentication.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/downloaded/cancel', {
        headers: {
            Authorization: `Bearer wrong token`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: 920
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(401);
});

test('NC-3488 FOTA Verify Post request cancel the created job when with invalid end point.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/downloaded/cancelinvalidendpoint', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: 920
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(404);
});

test('NC-3489 FOTA Verify Post request cancel the created job when with invalid request method.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.delete('https://sam-staging.dualinventive.com/api/fota/jobs/downloaded/cancel', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: 920
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(405);
});

test('NC-3490 FOTA Verify Post request cancel the created job when with invalid request body.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.delete('https://sam-staging.dualinventive.com/api/fota/jobs/downloaded/cancel', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            "job_ids": ["920"]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(405);
});

test('NC-3479 FOTA Verify successfully cancel the created job using downloaded cancel API.', async ({ request }) => {
    // Perform the POST request using Playwright's request object
    const response = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            updates: [5551986]
        }
    });

    // Check the response status
    expect(response.status()).toBe(201);

    // Parse the response body
    const responseBody = await response.json();

    // Define the expected structure and values
    const expectedUid = "100fc133742000000000000000000010";
    const expectedJobState = "DownloadQueued";

    // Check if the response body contains the required tags and values
    const device = responseBody.find((device: { uid: string; }) => device.uid === expectedUid);
    expect(device).not.toBeUndefined();
    const job = device.jobs.find((job: {
        uid: string;
        state: string;
    }) => job.uid === expectedUid && job.state === expectedJobState);
    expect(job).not.toBeUndefined();
    expect(job.state).toBe(expectedJobState);

    const jobIds = responseBody[0].jobs.map(job => Number(job.id));
    console.log("Job Id: "+jobIds);

    const payload = { job_ids: jobIds };
    console.log("Payload:", payload);

    // Function to add a delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(10000);

    // Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/downloaded/cancel', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: jobIds
        }
    });

    // Check the response status
    expect(cancelResponse.status()).toBe(200);

    // Parse the response body
    const cancelResponseBody = await cancelResponse.json();

    // Verify response fields
    cancelResponseBody.forEach(job => {
        const { successful, uid, state } = job;
        console.log(`Verifying job with ID ${job.id}`);
        // Expect the job to be successful
        expect(successful).toBe(true);

        // Expect the UID to match the expected value
        expect(uid).toBe("100fc133742000000000000000000010");

        // Expect the state to be "DownloadReady"
        expect(state).toBe("DownloadReady");
    });
});
