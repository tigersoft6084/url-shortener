# URL Shortener

This is a demo web application implementing a URL shortener using TypeScript, Express and React with an in-memory database persisted on-disk.

## Launch the app locally

The app repo is shipped with a Docker Compose file alowing one step launch of the app on your local machine. Run the commands below to get the app up and running:

```shell
git clone git@github.com:tigersoft6084/url-shortener.git
cd url-shortener
docker-compose up
```

Let Docker do its heavy-lifting for a couple of minutes and as soon as you see the below log line, go ahead and navigate your browser to `http://localhost:8000` and start playing around with your own local URL shortener.

```log
Server is running on http://localhost:8000
```

## Implemented Features
- Build a web page with a form for entering a URL
- When the form is submitted, return a shortened version of the URL
- Save a record of the shortened URL to a database
- Ensure the slug of the URL (abc123 in the screenshot above) is unique
- When the shortened URL is accessed, redirect to the stored URL 
- If an invalid slug is accessed, display a 404 Not Found page
- Validate the URL provided is an actual URL
- Display an error message if invalid
- Make it easy to copy the shortened URL to the clipboard
- Add rate-limiting to prevent bad-actors from spamming the service