import {expect, test} from "@playwright/test";
import {deviceUids} from "../common/util";

test('NC-3694 FOTA Verify Post request cancel the installed job when without authentication.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/update', {
        headers: {
            Authorization: ``,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [1738]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(401);
});

test('NC-3695 FOTA Verify Post request cancel the installed job when with wrong authentication.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/update', {
        headers: {
            Authorization: `Bearer wrong token`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [1738]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(401);
});

test('NC-3696 FOTA Verify Post request cancel the installed job when with invalid end point.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/updateinvalidendPoint', {
        headers: {
            Authorization: `Bearer wrong token`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [1738]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(404);
});

test('NC-3697 FOTA Verify Post request cancel the installed job when with invalid request method.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.delete('https://sam-staging.dualinventive.com/api/fota/jobs/update', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [1738]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(405);
});

test('NC-3698 FOTA Verify Post request cancel the installed job when with invalid request body.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/update', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: ["1738"]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(400);
});

test('NC-3693 FOTA Verify Post request cancel the installed job when without authentication.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/cancel', {
        headers: {
            Authorization: ``,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [1738]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(401);
});

test('NC-3692 FOTA Verify Post request cancel the installed job when with wrong authentication.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/cancel', {
        headers: {
            Authorization: `Bearer wrong token`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [1738]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(401);
});

test('NC-3691 FOTA Verify Post request cancel the installed job when with invalid end point.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/cancelinvalidendPoint', {
        headers: {
            Authorization: `Bearer wrong token`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [1738]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(404);
});

test('NC-3690 FOTA Verify Post request cancel the installed job when with invalid request method.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.get('https://sam-staging.dualinventive.com/api/fota/jobs/cancel', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: [1738]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(405);
});

test('NC-3689 FOTA Verify Post request cancel the installed job when with invalid request body.', async ({ request }) => {
    //Cancel the downloaded job
    const cancelResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/cancel', {
        headers: {
            Authorization: `Bearer ${process.env.TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: {
            job_ids: ["1738"]
        }
    });
    // Check the response status
    expect(cancelResponse.status()).toBe(400);
});

    test('NC-3679 FOTA Verify successfully cancel the created job using job cancel API.', async ({request}) => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const deviceUID = deviceUids.Mitra_device_7425;
        // Step 1: Create a job
        const createJobResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                updates: [6126355]
            }
        });
        expect(createJobResponse.status()).toBe(201);
        const createJobResponseBody = await createJobResponse.json();

        const expectedUid = deviceUID;
        const expectedJobState = "DownloadQueued";
        const expectedJobStateUpdate = "UpdateQueued";
        const expectedJobStateInstalled = "Installed";

        const device = createJobResponseBody.find((device) => device.uid === expectedUid);
        expect(device).not.toBeUndefined();

        const job = device.jobs.find((job) => job.uid === expectedUid && job.state === expectedJobState);
        expect(job).not.toBeUndefined();
        expect(job.state).toBe(expectedJobState);

        const jobIds = createJobResponseBody[0].jobs.map(job => Number(job.id));
        console.log("Job Ids: " + jobIds);

        await delay(5000);

        // Step 2: Update the job
        const updateJobResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/update', {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                job_ids: jobIds
            }
        });
        expect(updateJobResponse.status()).toBe(200);
        const updateJobBody = await updateJobResponse.json();
        console.log("Update Response Body: ", updateJobBody);

        const updatedJob = updateJobBody.jobs.find(job => job.uid === expectedUid && job.state === expectedJobStateUpdate);
        expect(updatedJob).not.toBeUndefined();
        expect(updatedJob.state).toBe(expectedJobStateUpdate);

        console.log("Updated Job Ids: " + jobIds);

        await delay(12000);

        // Step 3: Verify the job state
        const getJobResponse = await request.get("/api/fota/jobs?", {
            params: {
                page: 1,
                per_page: 1,
                sort: 'updated_at',
                sort_dir: 'desc',
                search: deviceUID
            },
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        });
        expect(getJobResponse.status()).toBe(200);
        const getJobResponseBody = await getJobResponse.json();
        console.log(getJobResponseBody);

        getJobResponseBody.forEach((data, index) => {
            console.log(`Device ${index + 1}:`);
            expect(data.uid).toEqual(expectedUid);
            expect(data.state).toEqual(expectedJobStateInstalled);
        });

        // Step 4: Cancel the job
        const cancelJobResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/cancel', {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                job_ids: jobIds
            }
        });
        expect(cancelJobResponse.status()).toBe(200);
        const cancelJobResponseBody = await cancelJobResponse.json();

        cancelJobResponseBody.forEach(job => {
            console.log(`Verifying job with ID ${job.id}`);
            expect(job.successful).toBe(true);
            expect(job.uid).toBe(expectedUid);
            expect(job.state).toBe('Installed');
        });

        // Step 5: Verify the job state
        const getJobResponse2 = await request.get("/api/fota/jobs?", {
            params: {
                page: 1,
                per_page: 1,
                sort: 'updated_at',
                sort_dir: 'desc',
                search: deviceUID
            },
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        });
        expect(getJobResponse2.status()).toBe(200);
        const getJobBody2 = await getJobResponse2.json();
        console.log(getJobBody2);

        getJobBody2.forEach((data, index) => {
            console.log(`Device ${index + 1}:`);
            expect(data.uid).toEqual(expectedUid);
            expect(data.state).toEqual('Cancel');
        });
    });

    test('NC-3736 FOTA Verify Post request successfully retry job.', async ({request}) => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const deviceUID = deviceUids.Mitra_device_7425;
        // Step 1: Create a job
        const createJobResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/bulk', {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                updates: [6126355]
            }
        });
        expect(createJobResponse.status()).toBe(201);
        const createJobResponseBody = await createJobResponse.json();

        const expectedUid = deviceUID;
        const expectedJobState = "DownloadQueued";
        const expectedJobStateUpdate = "UpdateQueued";
        const expectedJobStateError = "Error";

        const device = createJobResponseBody.find((device) => device.uid === expectedUid);
        expect(device).not.toBeUndefined();

        const job = device.jobs.find((job) => job.uid === expectedUid && job.state === expectedJobState);
        expect(job).not.toBeUndefined();
        expect(job.state).toBe(expectedJobState);

        const jobIds = createJobResponseBody[0].jobs.map(job => Number(job.id));
        console.log("Job Ids: " + jobIds);

        await delay(5000);

        // Step 2: Update the job
        const updateJobResponse = await request.post('https://sam-staging.dualinventive.com/api/fota/jobs/update', {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`,
                'Content-Type': 'application/json'
            },
            data: {
                job_ids: jobIds
            }
        });
        expect(updateJobResponse.status()).toBe(200);
        const updateJobBody = await updateJobResponse.json();
        console.log("Update Response Body: ", updateJobBody);

        const updatedJob = updateJobBody.jobs.find(job => job.uid === expectedUid && job.state === expectedJobStateUpdate);
        expect(updatedJob).not.toBeUndefined();
        expect(updatedJob.state).toBe(expectedJobStateUpdate);

        console.log("Updated Job Ids: " + jobIds);

        await delay(12000);

        // Step 3: Verify the job state
        const getJobResponse = await request.get("/api/fota/jobs?", {
            params: {
                page: 1,
                per_page: 1,
                sort: 'updated_at',
                sort_dir: 'desc',
                search: deviceUID
            },
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        });
        expect(getJobResponse.status()).toBe(200);
        const getJobResponseBody = await getJobResponse.json();
        console.log(getJobResponseBody);

        getJobResponseBody.forEach((data, index) => {
            console.log(`Device ${index + 1}:`);
            expect(data.uid).toEqual(expectedUid);
            expect(data.state).toEqual(expectedJobStateError);
        });
    });

    test('NC-3732 FOTA Verify Post request retry job when invalid endpoint.', async ({ request }) => {
        const get = await request.post(`/api/fota/jobs/retryInvalidEndPoint`,
            {
                headers:
                    { Authorization: `Bearer ${process.env.TOKEN}` },
                data: {
                    jobs: [1802]
                }
            })
        expect(get.status()).toEqual(404);
    });

test('NC-3733 FOTA Verify Post request retry job when without authentication.', async ({ request }) => {
    const get = await request.post(`/api/fota/jobs/retry`,
        {
            headers:
                { Authorization: `` },
            data: {
                jobs: [1802]
            }
        })
    expect(get.status()).toEqual(401);
});

test('NC-3734 FOTA Verify Post request retry job when invalid request body', async ({ request }) => {
    const get = await request.post(`/api/fota/jobs/retry`,
        {
            headers:
                { Authorization: `Bearer invalidToken` },
            data: {
                jobs: ["1802"]
            }
        })
    expect(get.status()).toEqual(401);
});

test('NC-3735 FOTA Verify Post request retry job when invalid request method', async ({ request }) => {
    const get = await request.delete(`/api/fota/jobs/retry`,
        {
            headers:
                { Authorization: `Bearer ${process.env.TOKEN}` },
            data: {
                jobs: [1802]
            }
        })
    expect(get.status()).toEqual(405);
});

