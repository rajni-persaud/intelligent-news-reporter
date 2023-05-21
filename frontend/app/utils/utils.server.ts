import axios from "axios";

export async function walker_run(nd = null, user: { token: any; email: any; } | undefined) {
  // name: string, email="", nd = null
  var name = "create_user";
  var server = "http://localhost:8000";
  var sentinel_id = "urn:uuid:1a079641-2571-4b18-a6fe-4989055e6b57";
  var token = user?.token;
  var email = user?.email;
  

  return axios.post(`${server}/js/walker_run`, {
      "name": name,
      "nd" : nd,
      "ctx": {email_id: email, verbose: true},
    //   "snt": sentinel_id,
      "detailed": false
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${token}`,
    },
  }).then(res => res.data)

}