# excalidraw-libraries-automation

Automate the process of excalidraw libraries

# Development

1. Install dependencies:

  ```
  yarn setup
  ```

2. Start Firebase emulator:

  ```
  yarn dev
  ```
3. open http://localhost:6001/excalidraw-room-persistence/us-central1/api/ and start coding in your favourite editpr

# Local publishing

In order to not spam the public library repository when developing new publishing features, you are encouraged to publish to a fork:

1. Fork https://github.com/excalidraw/excalidraw-libraries

2. Create a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

3. Create a `.env.local` file in the root of this project with the following content:

    ```
    GH_TOKEN=<your_github_token>
    GH_OWNER=<your_github_username>
    ```

4. Create a `.env.local` file in the root of your [Excalidraw](https://github.com/excalidraw/excalidraw) project:

    ```
    REACT_APP_LIBRARY_BACKEND=http://localhost:6001/excalidraw-room-persistence/us-central1/libraries
    ```

That's it. When publishing a library from a local dev Excalidraw instance, it'll send the request to your local excalidraw-automation server, which will then create a pull request in your library repository fork.
