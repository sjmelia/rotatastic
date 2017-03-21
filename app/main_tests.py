import os
import main
import unittest
import tempfile
from flask import json

class MainTestCase(unittest.TestCase):

    def setUp(self):
        self.db_fd, main.app.config['DATABASE'] = tempfile.mkstemp()
        main.app.config['TESTING'] = True
        self.app = main.app.test_client()
        with main.app.app_context():
            main.init_db()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(main.app.config['DATABASE'])

    def test_empty_db(self):
        rv = self.app.get('/rota/123')
        assert rv.status_code == 404

    def helper_create_rota(self, name):
        rv = self.app.post('/rota',
                           data=json.dumps(dict(name='new rota')),
                           content_type='application/json')
        assert rv.status_code == 200
        response = json.loads(rv.data)
        assert response["name"] == name
        return response

    def test_create_rota(self):
        response = self.helper_create_rota('new rota')
        uuid = response["uuid"]

        rv = self.app.get('/rota/' + uuid)
        assert rv.status_code == 200
        response = json.loads(rv.data)
        assert response["name"] == 'new rota'

    def test_update_rota(self):
        response = self.helper_create_rota('new rota')
        uuid = response["uuid"]

        rv = self.app.put('/rota/' + uuid,
                          data=json.dumps(dict(name='changed name')),
                          content_type='application/json')
        assert rv.status_code == 200
        response = json.loads(rv.data)
        assert response["name"] == 'changed name'

    def test_retrieve_empty_month(self):
        response = self.helper_create_rota('new rota')
        uuid = response['uuid']
        rv = self.app.get('/rota/' + uuid + '/entries/2017/02')
        assert rv.status_code == 200
        response = json.loads(rv.data)
        assert len(response) == 28
        assert response[0]['date'] == '2017-02-01'
        assert response[27]['date'] == '2017-02-28'

    def test_update_rota_entry(self):
        response = self.helper_create_rota('new rota')
        uuid = response['uuid']
        rv = self.app.put('/rota/' + uuid + '/entries/2017/02/02',
                           data=json.dumps(['@steve','@jeff']),
                           content_type='application/json')
        assert rv.status_code == 200

        rv = self.app.get('/rota/' + uuid + '/entries/2017/02')

        assert rv.status_code == 200
        response = json.loads(rv.data)
        assert response[1]['date'] == '2017-02-02'
        assert response[1]['entry'] == '["@steve", "@jeff"]'

        rv = self.app.put('/rota/' + uuid + '/entries/2017/02/02',
                          data=json.dumps(['@steve']),
                          content_type='application/json')
        assert rv.status_code == 200

        rv = self.app.get('/rota/' + uuid + '/entries/2017/02')

        assert rv.status_code == 200
        response = json.loads(rv.data)
        assert response[1]['date'] == '2017-02-02'
        assert response[1]['entry'] == '["@steve"]'

    def test_get_rota_entry(self):
        response = self.helper_create_rota('new rota')
        uuid = response['uuid']
        rv = self.app.put('/rota/' + uuid + '/entries/2017/02/02',
                          data=json.dumps(['@steve', '@jeff']),
                          content_type='application/json')
        assert rv.status_code == 200
        rv = self.app.get('/rota/' + uuid + '/entries/2017/02/02')

        assert rv.status_code == 200
        response = json.loads(rv.data)
        assert response['date'] == '2017-02-02'
        assert response['entry'] == '["@steve", "@jeff"]'

if __name__ == '__main__':
    unittest.main()
