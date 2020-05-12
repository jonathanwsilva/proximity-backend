import * as t from 'io-ts'
import { fold } from 'fp-ts/lib/Either'
import { flatten } from 'fp-ts/lib/Array'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { stringifyUrl } from 'query-string'
import fetch from 'node-fetch'

const endpoints = [
    {
        name: "Adzuna",
        // query, then validate against type spec, then tranform to common type for internal use
        getJobs: (query: string, location: string, { ADZUNA_ID, ADZUNA_KEY }: any) => fetch(stringifyUrl({
            url: 'https://api.adzuna.com/v1/api/jobs/us/search/',
            query: {
                app_id: ADZUNA_ID,
                app_key: ADZUNA_KEY,
                what: query,
                where: location,
                results_per_page: '50',
                distance: '15',
                sort_by: 'date'
            }
        }))
            .then(res => res.json())
            .then(json => AdzunaResponseV.decode(json))
            .then(jobsOrError => fold(
                () => { // On validation error
                    throw new TypeError(PathReporter.report(jobsOrError).join('\n'))
                },
                (jobs: AdzunaResponse) => jobs.results // On validation success, pass jobs thru
            )(jobsOrError))
            .then(jobs => jobs.map(({ title, redirect_url, company, latitude, longitude }) => ({
                title,
                company: company.display_name,
                url: redirect_url,
                coordinates: [longitude, latitude]
            })))
            .catch()
    }
]

// These are the parameters we expect to find on an Adzuna job.
const AdzunaJobV = t.interface({
    title: t.string,
    company: t.interface({ 
        display_name: t.string 
    }),
    redirect_url: t.string,
    latitude: t.number,
    longitude: t.number,
})

const AdzunaResponseV = t.interface({
    results: t.array(AdzunaJobV)
})

type AdzunaResponse = t.TypeOf<typeof AdzunaResponseV>;



// Call the getJobs method of every endpoint
export const getJobs = (query: string, location: string) => (
    Promise.all(
        endpoints.map(endpoint => endpoint.getJobs(query, location, process.env))
    ).then(flatten)
);