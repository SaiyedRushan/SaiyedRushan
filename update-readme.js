const fs = require("fs")
const axios = require("axios")
const dotenv = require("dotenv")
dotenv.config()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const USERNAME = "SaiyedRushan"
const blacklistRepos = ["AboutMe"]

async function getRepos() {
  try {
    const repos = []
    let page = 1
    while (true) {
      const { data } = await axios.get(`https://api.github.com/users/${USERNAME}/repos?sort=created&page=${page}`, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      })
      if (data.length === 0) break
      repos.push(...data.filter((repo) => !!repo.homepage && !blacklistRepos.includes(repo.name)))
      page++
    }
    return repos
  } catch (error) {
    console.error(error)
  }
}

async function updateReadme(repos) {
  const readmePath = "./README.md"

  let readmeContent = fs.readFileSync(readmePath, "utf-8")

  const deploymentSection = repos.map((repo) => `- [${repo.name}](${repo.url}) - [Deployment](${repo.homepage})`).join("\n")

  const newReadmeContent = readmeContent.replace(/<!-- REPOS-START -->[\s\S]*<!-- REPOS-END -->/, `<!-- REPOS-START -->\n${deploymentSection}\n<!-- REPOS-END -->`)

  fs.writeFileSync(readmePath, newReadmeContent)
}

;(async () => {
  const repos = await getRepos()
  await updateReadme(repos)
})()
