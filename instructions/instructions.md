# Product Requirements Document (PRD)

## Project Overview

We are developing a **Reddit Analytics Platform** that enables users to analyze and gain insights from various subreddits. Users can view top content, categorize posts, and understand thematic trends across different communities. The platform will be built using **Next.js 14**, **shadcn UI components**, **Tailwind CSS**, and **Lucide Icons** for a modern and responsive user interface.

We will utilize the **snoowrap** library to interact with the Reddit API for fetching posts and the **OpenAI API** for content analysis. The application should support concurrent data processing to ensure efficient performance.

## Table of Contents

1. [Goals and Objectives](#goals-and-objectives)
2. [Core Functionality](#core-functionality)
   - [1. Subreddit Management](#1-subreddit-management)
   - [2. Subreddit Detail Page](#2-subreddit-detail-page)
   - [3. Fetching Top Posts](#3-fetching-top-posts)
   - [4. Thematic Analysis](#4-thematic-analysis)
   - [5. Adding New Categories](#5-adding-new-categories)
3. [Technical Implementation](#technical-implementation)
   - [Project File Structure](#project-file-structure)
   - [Reddit Data Fetching](#reddit-data-fetching)
   - [OpenAI API Integration](#openai-api-integration)
   - [Concurrency Handling](#concurrency-handling)
4. [UI/UX Design](#uiux-design)
5. [Development Guidelines](#development-guidelines)
6. [Environment Setup](#environment-setup)
7. [Documentation](#documentation)
8. [Appendix](#appendix)
   - [Code Examples](#code-examples)

## Goals and Objectives

- **User Engagement**: Provide users with actionable insights from subreddits
- **Efficiency**: Implement concurrent processing for faster data analysis
- **Scalability**: Design a modular architecture that can handle many subreddits and themes
- **Usability**: Create an intuitive interface with clear navigation and interactive elements

## Core Functionality

### 1. Subreddit Management

#### 1.1 View Available Subreddits

- **Display**: Show a list of available subreddits as cards on the home page
- **Default Subreddits**: Include common subreddits like `ollama` and `openai`

#### 1.2 Add New Subreddits

- **Add Button**: Provide an "Add Subreddit" button on the home page
- **Modal Form**: Clicking the button opens a modal where users can input the Reddit URL of the subreddit
- **Validation**: Ensure the URL is valid and the subreddit exists
- **Update List**: Upon addition, display the new subreddit as a card on the home page

### 2. Subreddit Detail Page

#### 2.1 Navigation

- **Routing**: Clicking a subreddit card navigates to that subreddit's detail page
- **Dynamic Routing**: Use Next.js dynamic routes to handle multiple subreddits

#### 2.2 Tabs Interface

- **Tabs**: Display two tabs: "Top Posts" and "Themes"
- **Interaction**: Users can switch between tabs to view different analyses

### 3. Fetching Top Posts

#### 3.1 Data Retrieval

- **Time Frame**: Fetch Reddit posts from the past 24 hours
- **Library**: Use `snoowrap` for Reddit API interaction

#### 3.2 Data Display

- **Table Component**: Show posts in a sortable table
- **Fields**:
  - Title
  - Score
  - Content (Text)
  - URL
  - Creation Time (`created_utc`)
  - Number of Comments (`num_comments`)
- **Sorting**: Default sorting by score in descending order

### 4. Thematic Analysis

#### 4.1 Categories

- **Defined Themes**:
  - **Solution Requests**: Seeking solutions to problems
  - **Pain & Anger**: Expressing frustration or anger
  - **Advice Requests**: Seeking advice
  - **Money Talk**: Discussing financial aspects or spending money

#### 4.2 OpenAI Integration

- **Analysis Process**: Send post data to OpenAI API for categorization
- **Structured Output**: Receive a JSON response indicating category flags
- **Concurrency**: Process multiple posts concurrently for efficiency

#### 4.3 Display Themes

- **Theme Cards**: Display each category as a card on the "Themes" tab
- **Card Details**:
  - Title
  - Description
  - Count of Posts
- **Interactivity**:
  - Clicking a card opens a side panel
  - The side panel lists all posts under that category

### 5. Adding New Categories

#### 5.1 User Interaction

- **Add Theme Button**: Provide an option for users to add new categories
- **Trigger Re-analysis**: Adding a new theme triggers the analysis process again to include the new category

## Technical Implementation

### Project File Structure

```
── README.md
├── app
│   ├── favicon.ico
│   ├── fonts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── AddSubredditModal.tsx
│   ├── PostsTable.tsx
│   ├── SubredditCard.tsx
│   ├── SubredditTabs.tsx
│   ├── ThemeAnalysis.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── sheet.tsx
│       ├── table.tsx
│       └── tabs.tsx
├── components.json
├── instructions
│   ├── database_instructions.md
│   └── instructions.md
├── lib
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

### Reddit Data Fetching

#### Using `snoowrap` Library

```javascript
import Snoowrap from "snoowrap";

const redditClient = new Snoowrap({
  userAgent: "reddit-analytics-platform",
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

export async function fetchRecentPosts(subredditName) {
  try {
    const posts = await redditClient
      .getSubreddit(subredditName)
      .getNew({ time: "day" });

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.selftext || "",
      url: post.url,
      score: post.score,
      numComments: post.num_comments,
      createdUtc: new Date(post.created_utc * 1000),
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}
```

### OpenAI API Integration

#### Using OpenAI's `chat.completions.create`

```javascript
import OpenAI from "openai";
import { z } from "zod";

const PostCategorySchema = z.object({
  isSolutionRequest: z.boolean(),
  isPainOrAnger: z.boolean(),
  isAdviceRequest: z.boolean(),
  isMoneyTalk: z.boolean(),
});

export async function analyzePostCategory(post) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a Reddit post analyzer. Categorize the post based on its content.",
        },
        {
          role: "user",
          content: `Post Title: ${post.title}\nPost Content: ${post.content}`,
        },
      ],
      functions: [
        {
          name: "analyzePost",
          parameters: PostCategorySchema,
        },
      ],
      function_call: "auto",
      temperature: 0,
    });

    const result = JSON.parse(
      completion.choices[0].message.function_call.arguments
    );

    return PostCategorySchema.parse(result);
  } catch (error) {
    console.error("Error analyzing post:", error);
    throw error;
  }
}
```

### Concurrency Handling

```javascript
async function analyzePostsConcurrently(posts) {
  const analysisPromises = posts.map((post) => analyzePostCategory(post));
  return Promise.all(analysisPromises);
}
```

## UI/UX Design

- **Home Page**:

  - Display subreddit cards with the option to add new ones
  - Use shadcn UI components for consistency

- **Subreddit Detail Page**:

  - Implement tabs for "Top Posts" and "Themes"
  - Ensure smooth navigation between tabs

- **Posts Table**:

  - Make columns sortable
  - Allow users to click on a post to view more details

- **Theme Cards**:

  - Visually represent the number of posts in each category
  - Use Lucide Icons to enhance visual appeal

- **Add Subreddit Modal**:
  - Provide feedback on successful addition or errors
  - Validate user input before submission

## Development Guidelines

- Follow consistent coding conventions and best practices
- Document functions and complex logic
- Gracefully handle API failures and inform the user
- Use environment variables for sensitive information
- Write unit tests for utility functions and perform integration testing

## Environment Setup

1. Install Dependencies:

```bash
npm install
```

2. Environment Variables:
   Create a `.env` file at the project root with:

```env
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
OPENAI_API_KEY=your_openai_api_key
```

3. Run Development Server:

```bash
npm run dev
```

## Documentation

- Code Examples: Refer to the `src/lib` directory
- API References:
  - [snoowrap Documentation](https://github.com/not-an-aardvark/snoowrap)
  - [OpenAI Node.js Library](https://github.com/openai/openai-node)
- Styling:
  - [Tailwind CSS Documentation](https://tailwindcss.com/docs)
  - [shadcn UI Components](https://ui.shadcn.com/)

## Appendix

### Code Examples

```javascript
// Fetching Recent Posts
import { fetchRecentPosts } from "@/lib/reddit";

async function getPosts(subreddit) {
  const posts = await fetchRecentPosts(subreddit);
  // Handle posts
}

// Analyzing a Single Post
import { analyzePostCategory } from "@/lib/openai";

async function analyzePost(post) {
  const analysis = await analyzePostCategory(post);
  // Handle analysis results
}

// Combining Fetching and Analysis
async function getAndAnalyzePosts(subreddit) {
  const posts = await fetchRecentPosts(subreddit);
  const analyses = await analyzePostsConcurrently(posts);

  // Combine posts with their analyses
  return posts.map((post, index) => ({
    ...post,
    analysis: analyses[index],
  }));
}
```
