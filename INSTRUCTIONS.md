# Research Engineering Intern Assignment
We're thrilled you're interested in joining SimPPL! This assignment is designed to give you a practical, hands-on experience in social media analysis, mirroring the kind of work you'd be doing with us. It's structured like a mini-research project, challenging you to explore how information spreads across social networks, specifically focusing on content from potentially unreliable sources.  Instead of building a data collection tool from scratch for this initial exercise, you'll be provided with existing social media data. Your task is to design and build an interactive dashboard to analyze and visualize this data, uncovering patterns and insights about how specific links, hashtags, keywords, or topics are being shared and discussed.  This will allow you to focus on your data science, machine learning, and analysis skills, which are crucial to the research we conduct at SimPPL. The plots you create and the technologies you choose will be valuable learning experiences, and directly relevant to the work we do. 

## Why do we care about this?

We have built tools for collecting and analyzing data from Reddit and Twitter including now-obsolete platform [Parrot](https://www.youtube.com/watch?v=FVetP1D5u0o) to study the sharing of news from certain unreliable state-backed media. To ramp you up towards understanding how to go about extending such platforms, and to expand your understanding of the broader social media ecosystem, we would like you to develop a similar system to trace digital narratives. We would like you to present an analysis of a broader range of viewpoints from different (apolitical / politically biased) groups. You may even pick a case study to present e.g. a relevant controversy, campaign, or civic event. The goal is for you to be creative and explore what could be possible to contribute a meaningful assignment rather than just sticking to our instructions. 

In the long run, this research intends to accomplish the following objectives:

1. Track different popular trends to understand how public content is shared on different social media platforms.
2. Identify digital threats such as actors and networks promoting scams, spam, fraud, hate, harassment, or misleading claims.
3. Analyze the trends across a large number of influential accounts over time in order to report on the _influence_ of a narrative. Here, you must think and develop your own methods to report what you think is most interesting about the analysis you are doing. 

## Task Objectives

1. **Visualize Insights**: Tell a story with a graph, building intuitive and engaging data visualizations.

2. **Apply AI/ML**: Use LLMs and machine learning to generate metrics and enhance your analysis.

3. **Build and Deploy an Investigative Reporting Dashboard**: Develop and host an interactive dashboard to showcase your analysis. You should be able to query the dashboard to generate meaningful insights.

Before moving on, please understand that even if you accomplish all of these objectives that does not mean you have submitted a *good* assignment. This is simply because almost all of the applying candidates accomplish all these objectives very well--making it a bare minimum for qualifying. 

**Note:** What we ultimately use to evaluate applicants is how well the assignment reflects your expertise and knowledge of latest techniques (or how well you were able to _look up, implement, AND explain clearly_ the latest techniques for the same), the level of thought you put into the design of the submission, and the goal you decided that this exploratory platform should enable for its users. That's where we want to see how creative you can be, and it comes across very clearly the minute we have interviews with applicants--especially if you are overly dependent on AI to help with each of these goals instead of thinking for yourself. 

## Examples of "How to Tell a Story with Data" (please spend time looking up other similar platforms and tell us what you find by including them in your README)

There are some hosted web demos (note that some are blog posts, but they include graphs that we would want you to develop in an interactive dashboard) that **tell a story** with data that you should look into. We do not expect you to replicate or copy any of these but we do want you to understand the "tell us a story with data" goal of this assignment better by looking at these:
1. [Fabio Gieglietto's TikTok Coordinated Behavior Report](https://fabiogiglietto.github.io/tiktok_csbn/tt_viz.html)
2. [Integrity Institute's Information Amplification Dashboard](https://integrityinstitute.org/blog/misinformation-amplification-tracking-dashboard)
3. [News Literacy Project Dashboard](https://misinfodashboard.newslit.org/)
4. [Tableau examples (note: we don't use Tableau, and expect you to use Python or Javascript for this assignment, but these are interesting examples for inspiration)](https://public.tableau.com/app/search/vizzes/misinformation)

## Rubric for Evaluation

Below is the rubric we will use for your evaluation, provided as a checklist for you to evaluate your own assignment before you submit it to us. Again, remember the note above about how we evaluate assignments -- even if yours doesn't meet all these rubrics but it is unique from other submissions while reflective of your technical expertise, we would be open to advancing you in the interview process.

1. **IMPORTANT** Is the solution well-documented such that it is easy to understand its usage?
  
2. **IMPORTANT** Is the solution hosted (on a publicly accessible web dashboard) with a neatly designed frontend?
   
3. **IMPORTANT** Does the solution visualize summary statistics for the results? For example:

  &emsp; a. Time series of the number of posts matching a search query 
  
  &emsp; b. Time series of key topics, themes, or trends in the content
  
  &emsp; c. Pie chart of communities (or accounts) on the social media platform that are key contributors to a set of results
  
  &emsp; d. Network visualization of accounts that have shared a particular keyword, hashtag, or URL using additional data they may have shared

4. **IMPORTANT** Does the solution offer interactive and multimodal querying that allows the user to generate insights from the data?

   a. Chatbot to query the data and answer questions that the user inputs about the trends for particular topics, themes, narratives, and news articles.
   b. Multimodal analysis to showcase how you might be able to better study and present the trends in the content of the images, audio, or video within the dataset. 

6. Unique features (optional, but here are some creative and useful features past applicants have built that resulted in successful outcomes):

   &emsp; a. Topic models embedding all the content of results using Tensorflow projector (free, basic), Datamapplot (free, advanced), or Nomic (paid) as a platform to visualize the semantic map of the posts.
   
   &emsp; b. GenAI summaries of the time-series plots for non-technical audiences to understand the trends better.
   
   &emsp; c. Chatbot to refine and suggest follow-up queries to the user's original query.
   
   &emsp; d. Connecting offline events from the news articles with the online sharing of posts on social media for specific searches (for example using Wikipedia to find key events in the Russian invasion of Ukraine and map them  to the online narratives that are shared – though this is somewhat manual and not easy to automate, but extremely useful nevertheless).
   
   &emsp; e. Connecting multiple platform datasets together to search for data across multiple social platforms.
   
   &emsp; f. Semantic search after retrieving all posts matching a URL so that the retrieved results can be queried beyond keyword matching.
   
As a reminder, we expect you to host your Jupyter Notebook or JS dashboard on a publicly accessible website.


### Link to the dataset 
<a href="https://drive.google.com/drive/folders/13cYfPIV65j5AAh9GjuZR94sAx-7EFjnp?usp=sharing">Dataset</a> 

## Instruction for the submission
These instructions outline how to use GitHub for this assignment.  Please follow them carefully to ensure your work is properly submitted.

1. Fork the Repository:    
   - Go to the assignment repository provided by the instructor: [Insert Repository Link Here] 
   - Click the "Fork" button in the top right corner of the page. This creates a copy of the repository in your GitHub account. 
  
3. Clone Your Fork:
   - Go to your forked repository (it will be in your GitHub account).
   - Click the "Code" button (the green one) and copy the URL. This will be a git URL (ending in .git).
   - Open a terminal or Git Bash on your local machine.
   - Navigate to the directory where you want to work on the assignment using the cd command. For example: `cd /path/to/your/projects`.
   - Clone your forked repository using the following command: git clone <your_forked_repository_url> (Replace <your_forked_repository_url> with the URL you copied).
  
   This will download the repository to your local machine.

4. Develop Your Solution

   Work on your assignment within the cloned repository. Create your code files, visualizations, and any other required deliverables. Make sure to save your work regularly.

6. Commit Your Changes
   - After making changes, you need to "stage" them for commit. This tells Git which changes you want to include in the next snapshot.
   - Use the following command to stage all changes in the current directory:
      - To add all the files - git add. 
      - Or, if you want to stage-specific files - git add <file1> <file2> ...
   - Now, commit your staged changes with a descriptive message- git commit -m "Your commit message here" (Replace "Your commit message here" with a brief1 description of the changes you made.2 Be clear and concise!)
   - Push your commits back to your forked repository on GitHub- git push origin main (Or, if you're working on a branch other than main, replace main with your branch name. origin refers to the remote repository you cloned from). 

7. Please notify us of your submission by emailing simppl.collabs@gmail.com with the subject line "Submitting Research Engineer Intern Assignment for SimPPL".

### Submission Requirements

Please ensure you include:

1. A detailed README file (with screenshots of your solution, a URL to your publicly accessible _hosted_ web platform).
2. A text-based explanation of your code and thought process underlying system design. 
3. A link to a video recording of your dashboard hosted on YouTube or Google Drive. You can talk and explain your idea as you walk us through the platform.

Both of these last two make it easier for us to run your code and evaluate the assignment.

### AI Usage Policy

We're an AI-first company and we certainly appreciate the thoughtful and human-verified use of coding copilots to write code. If you do use AI to write any code, we would like you to commit a file called <yourname>-prompts.md within your repository so we understand how you prompt AI models. Please separate your prompts by numbering them so we can also follow how you progressively prompted the models to write any parts of your codebase and what bugs you found and fixed in the process. Yes, we do evaluate your prompt engineering capabilities and yes it is a plus if you're good at prompt and [context engineering](https://www.philschmid.de/context-engineering). Without visibility into the prompts you engineer, we cannot assess your ability to use AI copilots for programming. In that case you lose out on a few brownie points you would otherwise get from our team for being smart about AI use in your work.

We have seen enough horrendous code written by AI and been forced to part with a teammate who refused to verify AI generated code and kept breaking our codebase with their pull requests. So this is a real problem that we are tackling. We also have teammates who were hesitant to use AI and then we had to coach them through the process of learning to write code with AI which was helpful to them. The institution of this policy is so that we don't end up hiring vibe coders who do not care about the quality and only care about the volume and pace of production of output. It is so that we prioritize the hiring of smart engineers who can leverage the cutting edge tools at their disposal to write great code. 


### Resources
1. [OSINT Tools](https://start.me/p/0Pqbdg/osint-500-tools)
2. [Colly](http://go-colly.org/)
3. [AppWorld](https://appworld.dev/)
4. [Scrapling](https://github.com/D4Vinci/Scrapling)
5. [Selenium](https://www.selenium.dev/)
6. [Puppeteer](https://pptr.dev/)
7. [DuckDB](https://github.com/duckdb/duckdb)
8. [Cloudfare Workers](https://workers.cloudflare.com/)
9. [Apache Superset](https://github.com/apache/superset)
10. [Terraform](https://www.hashicorp.com/en/products/terraform)

#### Note

Focus on the analysis you are presenting and the story you are telling us through it. A well-designed and scalable system is more important than a complex one with a ton of features. Consider using innovative technologies in a user-friendly manner to create unique features for your platform such as AI-generated summaries that are adaptable to the data a user searches for, using your platform.

Presentation matters! Make sure your submission is easy to understand. Create an intuitive and meaningful README file or a Wiki that can be used to review your solution. Host it so it is accessible by anyone. Ensure that you share a video demo even if it is hosted, so that users understand how to interpret the insights you present. Go through the [PRO TIPS](/PRO-TIPS.md) to get a better sense of what might help you be successful in this endeavor.

At SimPPL, we're building tools to analyze how information spreads on social media. Your work will help inform how to scale our analysis to a wider range of platforms and handle larger datasets. This is crucial for tracking trends, identifying digital harms, and understanding how narratives spread online.

We're excited to see your solution!




