# Datadog Monitoring — Deploy Guide

## Prerequisites
- Datadog account with API key
- DigitalOcean Droplet with SSH access
- `DD_API_KEY` and `DD_ENV` set in your environment

## Step 1: Install Datadog Agent

```bash
# SSH into your droplet
ssh root@<your-droplet-ip>

# Install Agent v7
DD_API_KEY=<your_api_key> DD_SITE="datadoghq.com" bash -c \
  "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"

# Verify
datadog-agent status
```

## Step 2: Apply Agent Config

```bash
# Copy the config
sudo mkdir -p /etc/datadog-agent/conf.d/redisdb.d/
sudo cp monitoring/datadog-agent.yaml /etc/datadog-agent/datadog.yaml
sudo cp monitoring/conf.d/node.yaml /etc/datadog-agent/conf.d/node.d/conf.yaml
sudo cp monitoring/conf.d/redisdb.yaml /etc/datadog-agent/conf.d/redisdb.d/conf.yaml

# Set env vars in /etc/default/datadog-agent
echo 'DD_API_KEY=<your_key>' | sudo tee -a /etc/default/datadog-agent
echo 'DD_ENV=production' | sudo tee -a /etc/default/datadog-agent

# Restart
sudo systemctl restart datadog-agent
```

## Step 3: Deploy Backend with DD_ENABLED

In your Railway / DO App Platform environment variables:

```
DD_ENABLED=true
DD_AGENT_HOST=localhost       # falls back to localhost by default
DD_TRACE_AGENT_PORT=8126
DD_ENV=production
DD_LOGS_INJECTION=true
```

If the Node.js process runs on a **different host** than the Agent, set:
```
DD_AGENT_HOST=<droplet-private-ip>
```

## Step 4: Import Dashboard

Via Datadog UI:
1. Dashboards → New Dashboard → Import Dashboard JSON
2. Paste contents of `monitoring/schoolos-dashboard.json`

Via API:
```bash
curl -X POST "https://api.datadoghq.com/api/v1/dashboard" \
  -H "Content-Type: application/json" \
  -H "DD-API-KEY: $DD_API_KEY" \
  -H "DD-APPLICATION-KEY: $DD_APP_KEY" \
  -d @monitoring/schoolos-dashboard.json
```

## Step 5: Import Alerts

Via Datadog UI:
1. Monitors → New Monitor → Import from JSON
2. Import each alert in `monitoring/schoolos-alerts.json`

Via API:
```bash
for alert in $(cat monitoring/schoolos-alerts.json | jq -c '.alerts[]'); do
  curl -X POST "https://api.datadoghq.com/api/v1/monitor" \
    -H "Content-Type: application/json" \
    -H "DD-API-KEY: $DD_API_KEY" \
    -H "DD-APPLICATION-KEY: $DD_APP_KEY" \
    -d "$alert"
done
```

## Custom Metrics Dashboard

The dashboard includes:
| Widget | Metric | Description |
|--------|--------|-------------|
| Request Rate | `schoolos.api.requests` | Count by route (bars) |
| Error Rate | `schoolos.api.requests{5xx} / total * 100` | % error rate with 1% marker |
| Avg Response Time | `schoolos.api.response_time` | Avg ms by route with 2s marker |
| P95 Response Time | `schoolos.api.response_time` | P95 by route |
| Redis: Trial Queue | `schoolos.redis.queue_depth` | Queue: waiting/active/failed |
| Redis: Report Queue | `schoolos.redis.queue_depth` | Queue: waiting/active/failed |
| Top 5 Slow Endpoints | `schoolos.api.response_time` | Ranking by avg ms |
| DB P99 Query Time | `schoolos.db.query_time` | Single-value widget |
| Slow Queries | `schoolos.db.slow_query` | Count of >1s queries |

## Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| High Error Rate | 5xx rate > 1% | Critical |
| High Response Time | Avg > 2s per route | Warning |
| Queue Backlog | Trial queue waiting > 50 | Warning |
| Slow DB Query | Avg > 3s per query | Warning |
| Host Down | CPU < 0.1% for 5 min | Critical |

## Verifying Metrics

```bash
# From the droplet, check Agent sees custom metrics:
datadog-agent dogstatsd-stats

# Check APM traces are flowing:
curl http://localhost:8126/v0.4/traces/stats

# Check the Node.js app logs:
journalctl -u datadog-agent --no-pager -n 50
```
