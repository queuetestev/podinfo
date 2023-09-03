var completed = false

var branch_name;
var pr_url;
var commit_url;

if (context.eventName === 'merge_group'){

  const branch_ref = context.payload.merge_group.head_ref

  const after_last_slash = /'[^/]*$'/.exec(branch_ref)[0]

  const pr_number = after_last_slash.split('-')[1]

  const pr = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr_number,
  });

  branch_name = `${pr.data.head.ref}-${context.repo.repo}${process.env.suffix}`
  pr_url = ${pr.data.html_url}
  commit_url = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.payload.merge_group.head_sha}`
  
} else if (context.eventName === 'push') {

    // Find project PR that generated this master commit and set branch name
    core.info('Listing pull requests to find the match of this commit')
    for await (const response of github.paginate.iterator(
      github.rest.pulls.list,
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: 'all',
        base: 'master',
      }
    )){
      

      for (const pull of response.data){
        if (pull.merge_commit_sha == context.sha){
          core.info('Matching pull request found, generating step outputs')
          branch_name = `${pull.head.ref}-${context.repo.repo}${process.env.suffix}`
          pr_url = pull.html_url
          core.info('Outputs branch_name and pr_url have been generated successfully')
          completed = true
          break
        }
      }

      if (completed){
        break
      }
      
    }

    commit_url = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}`

    // If no PR is found for push in master event set branch name to feature/<project>-<sha>
    if (!completed){
      core.setOutput('branch_name',`feature/${context.repo.repo}-${context.sha}`)
      core.info('No matching PR was found, using default branch naming (feature/<project>-<sha>)')
}

} else if (context.eventName == 'workflow_dispatch') {

  branch_name = `${process.env.GITHUB_REF_NAME}-${context.repo.repo}${process.env.suffix}`

  if (context.payload.inputs.build == 'ondemand') {

    commit_url = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}`

  } 
  
}

core.setOutput('branch_name', branch_name)
core.setOutput('pr_url', pr_url)
core.setOutput('commit_url',`${commit_info.data.html_url}`)
core.info('Outputs branch_name, pr_url, and commit_url have been generated successfully')