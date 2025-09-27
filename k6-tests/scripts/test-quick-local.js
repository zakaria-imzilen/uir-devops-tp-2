import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
};

export default function () {
  const response = http.get('http://localhost:3000');
  console.log(`Status: ${response.status}, Temps: ${response.timings.duration}ms`);
  
  check(response, {
    'Application locale disponible': (r) => r.status === 200,
    'Temps de reponse OK': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}
