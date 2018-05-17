# Job_queue

# Installation

This project uses mongodb, loopback API service and monq:

    $ npm install
    
To run the project, first run mongodb:

    mongd

# Usage

POST

    curl -X POST --header 'Content-Type: application/x-www-form-urlencoded' --header 'Accept: application/json' -d 'url=www.google.com' 'http://localhost:3000/api/jobs/createFromUrl'

Request URL

    http://localhost:3000/api/jobs/createFromUrl

Response Body

    {
      "id": "5afceaab62b455356616fa7c",
      "respond": "<!doctype html><html itemscope=\"\" </script></div></body></html>",
      "status": "queued"
    }

GET

    curl -X GET --header 'Accept: application/json' 'http://localhost:3000/api/jobs/status?id=5afceaab62b455356616fa7c'

Request URL

    http://localhost:3000/api/jobs/status?id=5afceaab62b455356616fa7c


Example

    {
      "id": "5afceaab62b455356616fa7c",
      "respond": "<!doctype html><html itemscope=\"\" </script></div></body></html>",
      "status": "queued"
    }
