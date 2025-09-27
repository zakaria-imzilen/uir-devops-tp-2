import http from 'k6/http';
import { sleep, check, group } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
    http_reqs: ['rate>10'],
  },
};

export default function () {
  const baseUrl = 'http://localhost:3000';
  
  group('Page d accueil', function () {
    const response = http.get(baseUrl);
    check(response, {
      'Page d accueil chargee (200)': (r) => r.status === 200,
      'Temps de reponse acceptable': (r) => r.timings.duration < 2000,
      'Contenu present': (r) => r.body.length > 0,
    });
  });

  sleep(Math.random() * 2 + 1);
}
