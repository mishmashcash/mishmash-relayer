# Relayer for MishMash.cash 

## Run locally

1. `yarn`
2. `cp .env.example .env`
3. Modify `.env` as needed
4. `yarn start`
5. Go to `http://127.0.0.1:8000`
6. In order to execute withdraw request, you can run following command

```bash
curl -X POST -H 'content-type:application/json' --data '<input data>' http://127.0.0.1:8000/relay
```

Relayer should return a transaction hash

In that case you will need to add https termination yourself because browsers with default settings will prevent https
tornado.cash UI from submitting your request over http connection

## Run geth node

It is strongly recommended that you use your own RPC node. Instruction on how to run full node with `etc-sc` can be found [here](https://github.com/electroneum/electroneum-sc?tab=readme-ov-file#running-etn-sc).

## Monitoring

You can find the guide on how to install the Zabbix server in the [/monitoring/README.md](/monitoring/README.md).

## Architecture

1. TreeWatcher module keeps track of Account Tree changes and automatically caches the actual state in Redis and emits `treeUpdate` event to redis pub/sub channel
2. Server module is Express.js instance that accepts http requests
3. Controller contains handlers for the Server endpoints. It validates input data and adds a Job to Queue.
4. Queue module is used by Controller to put and get Job from queue (bull wrapper)
5. Status module contains handler to get a Job status. It's used by UI for pull updates
6. Validate contains validation logic for all endpoints
7. Worker is the main module that gets a Job from queue and processes it

Disclaimer:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
