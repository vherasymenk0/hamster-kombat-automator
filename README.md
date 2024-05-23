![Alt text](/.github/hamster_preview.png)

<div style="">
    <div style="display: flex; align-items: center">
        <span>☕</span>
        <h5 style="padding-left: 10px">Like my bot? Buy me a coffee. Thanks for your support!</h5>
    </div>
    <div style="display: flex; margin-top: -15px">
        <img src="https://metamask.io/images/metamask-logo.png" width="20" height="20">
        <span style="padding-left: 10px"><strong>0x251d1EA8113549B6874cF30e32C2030f423BB655</strong></span>
    </div>
</div>


### 📜 **Script features**
- real user agents (android)
- proxy binding to an account
- support running on multiple accounts (single-threaded execution in parallel mode)
---
### 🤖 **Automator functionality**
- buying upgrades at the best price/profit ratio
- auto-clicker
- use of daily energy recharger
- daily reward collection
- exchange selection
- ability to enable/disable auto-clicker
---
### 📝 Settings via .env file
| Property                 | Description                                                                             |
|--------------------------|-----------------------------------------------------------------------------------------|
| 🔑 **API_ID / API_HASH** | Telegram client app credentials ([FYI](https://core.telegram.org/api/obtaining_api_id)) |
| 🌐 **USE_PROXY**         | OFF/ON start in proxy mode (**true / false**) - default **false**                       |
| 🖱️ **TAP_MODE**         | OFF/ON auto clicker (**true / false**) - default **true**                               |
---
### 📥 Installation

1. Download & install nodejs >= 16 [link](https://nodejs.org/en/download/package-manager/current)
2. Clone the repository
3. Create an .env file and insert your values (variables in .env-example)
4. `npm install`
5. `npm run build`

### 🚀 Startup
1. `npm run start`
2. Select **Add new account** and follow the instructions
3. `npm run start`
4. Select **Run automator** --> DONE!

### 🤝 For contributors
- to start in development mode, use `npm run dev`
- before creating a pull request, run the following commands and fix the errors if necessary:
  - `npm run type-check` (typescript typing check)
  - `npm run lint` (running eslint)
