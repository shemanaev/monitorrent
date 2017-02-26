import fetchMock from 'fetch-mock'
import api from 'src/api/monitorrent'
import { expect } from 'chai'

describe('API', () => {
    afterEach(fetchMock.restore)

    it('getTopics should call /api/topics', async () => {
        const topics = [
            { display_name: 'Topic 1 (Season 1)', tracker: 'rutor.info', last_update: null },
            { display_name: 'Topic 2 (Season 3)', tracker: 'rutor.info', last_update: '2017-02-21T00:35:47' }
        ]
        fetchMock.get('/api/topics', topics)

        const fetchedTopics = await api.getTopics()
        expect(fetchedTopics).to.be.eql(topics)
    })

    it(`getLogs should call /api/execute/logs?skip=0&take=10 without params`, async () => {
        const logs = {
            count: 10,
            data: []
        }
        fetchMock.get(`/api/execute/logs?skip=0&take=10`, logs)

        const fetchedLogs = await api.getLogs()
        expect(fetchedLogs).to.be.eql(logs)
    })

    it(`getLogs should call /api/execute/logs?skip=20&take=10 only with skip=20`, async () => {
        const logs = {
            count: 10,
            data: []
        }
        fetchMock.get(`/api/execute/logs?skip=20&take=10`, logs)

        const fetchedLogs = await api.getLogs(20)
        expect(fetchedLogs).to.be.eql(logs)
    })

    for (let [skip, take] of [[0, 1], [0, 10], [20, 10]]) {
        it(`getLogs should call /api/execute/logs?skip=${skip}&take=${take}`, async () => {
            const logs = {
                count: 10,
                data: []
            }
            fetchMock.get(`/api/execute/logs?skip=${skip}&take=${take}`, logs)

            const fetchedLogs = await api.getLogs(skip, take)
            expect(fetchedLogs).to.be.eql(logs)
        })
    }

    for (let value of [true, false]) {
        it(`setTopicStatus(${value}) should call /api/topics/12/paused`, async () => {
            fetchMock.post(`/api/topics/12/paused`, {status: 204})
            const resp = await api.setTopicPaused(12, value)

            expect(resp.status).to.equal(204)
        })
    }

    it(`setTopicPaused should throw on backend errors`, async () => {
        fetchMock.post(`/api/topics/12/paused`, {status: 500, body: {title: 'ServerError', description: 'Can\'t set topic 12 pause'}})

        const err = await expect(api.setTopicPaused(12)).to.eventually.rejectedWith(Error)

        expect(err.message).to.be.equal('ServerError')
        expect(err.description).to.be.equal('Can\'t set topic 12 pause')
    })
})