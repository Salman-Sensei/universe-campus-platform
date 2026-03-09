<h1 align="center">🌌 UniVerse Campus Platform</h1>

<h2>📖 Project Overview</h2>

<p>
<strong>UniVerse</strong> is a digital campus network designed for students and faculty to connect, collaborate, and share knowledge. 
Welcome to UniVerse — it brings your entire university experience online. Whether you're looking for study partners, sharing lecture notes, buying textbooks, or simply staying connected with campus life, UniVerse is your all-in-one platform. Built for students, by students.
</p>

<h3>Main Features</h3>

<ul>
<li><strong>Home Feed:</strong> Your main timeline showing posts from people you follow and trending campus content. Like, comment, and share posts.</li>
<li><strong>Stories:</strong> Share 24-hour updates with photos and text. View stories from classmates in the horizontal bar at the top of your feed.</li>
<li><strong>Posts & Comments:</strong> Create text and image posts. Comment on others' posts to start academic discussions and campus conversations.</li>
<li><strong>Followers:</strong> Follow classmates and faculty to build your academic network. See their posts in your feed.</li>
<li><strong>Communities:</strong> Join department-based communities like Software Engineering, AI, and Data Science to connect with peers.</li>
<li><strong>Events:</strong> Discover campus events — hackathons, seminars, study groups, and project meetings. RSVP and never miss out.</li>
<li><strong>Study Partner Finder:</strong> Find study partners by subject, semester, and availability. Join study sessions and ace your exams together.</li>
<li><strong>Notes Hub:</strong> Upload and download lecture notes, past papers, assignments, and study guides. Search by course and semester.</li>
<li><strong>Marketplace:</strong> Buy and sell textbooks, electronics, calculators, and more. List items with photos and prices.</li>
<li><strong>Confession Wall:</strong> Share anonymous confessions. React and comment on others' confessions in a safe space.</li>
</ul>

<hr>

<h2>🛠 Technologies Used</h2>

<h3>Frontend</h3>
<ul>
<li>React</li>
<li>TypeScript</li>
<li>Vite</li>
<li>Tailwind CSS</li>
<li>shadcn-ui</li>
<li>React Query / TanStack Query</li>
</ul>

<h3>Backend</h3>
<ul>
<li>Supabase (Authentication + Database + API)</li>
<li>Edge Functions for AI-powered features</li>
<li>Node.js & Express for extended API endpoints</li>
</ul>

<h3>AI & Integrations</h3>
<ul>
<li>OpenAI GPT APIs for summarization, recommendations, and academic insights</li>
<li>Cloud storage for media uploads</li>
</ul>

<h3>Deployment</h3>
<ul>
<li>Vercel (Cloud Hosting & Continuous Deployment)</li>
</ul>

<h3>Development Tools</h3>
<ul>
<li>Git & GitHub</li>
<li>VS Code / Preferred IDE</li>
<li>Node.js & npm</li>
</ul>

<hr>

<h2>⚙ Installation Instructions</h2>

<h3>1️⃣ Prerequisites</h3>
<ul>
<li>Node.js v18+</li>
<li>npm or yarn</li>
<li>Git</li>
<li>Supabase project credentials</li>
</ul>

<pre>
<code>
node -v
npm -v
git --version
</code>
</pre>

<h3>2️⃣ Clone the Repository</h3>
<pre>
<code>
git clone https://github.com/Salman-Sensei/universe-campus-platform.git
cd universe-campus-platform
</code>
</pre>

<h3>3️⃣ Install Dependencies</h3>
<pre>
<code>
npm install
</code>
</pre>

<h3>4️⃣ Configure Environment Variables</h3>
<pre>
<code>
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-anon-key
OPENAI_API_KEY=your-openai-api-key
</code>
</pre>

<h3>5️⃣ Start Development Server</h3>
<pre>
<code>
npm run dev
</code>
</pre>
<p>Access the platform locally at <code>http://localhost:5173</code></p>

<hr>

<h2>🚀 Usage Guidelines</h2>
<p>After starting the development server:</p>
<ol>
<li>Create student or faculty accounts</li>
<li>Explore posts, stories, communities, and AI-powered recommendations</li>
<li>Faculty can manage courses, events, and analytics dashboards</li>
</ol>

<h3>Example Workflow</h3>
<pre>
<code>
Student registers → Logs in → Shares posts, stories, notes → Receives AI insights
Faculty registers → Logs in → Publishes course materials → Monitors engagement → Interacts with students
</code>
</pre>

<hr>

<h2>🔗 Interfaces</h2>

<h3>1️⃣ Supabase Client Interface</h3>
<p><strong>Purpose:</strong> Connects frontend to Supabase backend for auth, database, and storage operations</p>
<pre>
<code>supabaseClient</code>
</pre>

<h4>Authentication Methods</h4>
<pre>
<code>
supabase.auth.signUp({ email: string, password: string })
supabase.auth.signInWithPassword({ email: string, password: string })
supabase.auth.signOut()
</code>
</pre>

<h3>2️⃣ Database Interface</h3>
<p>CRUD operations for content, users, communities, and posts</p>
<pre>
<code>
supabase.from("posts").select("*")
supabase.from("stories").insert({ content, theme, user_id })
supabase.from("notes").update({ title, file_url })
supabase.from("confessions").delete()
</code>
</pre>

<h3>3️⃣ AI Interface</h3>
<pre>
<code>
openAI.generateSummary(text: string) => string
openAI.getRecommendations(userId: string) => array
</code>
</pre>

<h3>4️⃣ UI Component Interface</h3>
<pre>
<code>
&lt;PostCard title="" content="" author_id="" /&gt;
&lt;StoryCard title="" content="" theme="" /&gt;
&lt;NotesCard title="" fileUrl="" course="" /&gt;
&lt;MarketplaceItemCard title="" price="" imageUrl="" /&gt;
</code>
</pre>

<hr>

<h2>🤝 Contribution Guidelines</h2>
<p>We welcome contributions from students, faculty, and developers.</p>
<ol>
<li>Fork repository</li>
<li>Create a branch <code>git checkout -b feature/your-feature</code></li>
<li>Implement and commit changes</li>
<li>Push branch <code>git push origin feature/your-feature</code></li>
<li>Create Pull Request for review</li>
</ol>

<h3>Coding Standards</h3>
<ul>
<li>Modular and reusable components</li>
<li>Consistent formatting and descriptive commits</li>
<li>Document new interfaces thoroughly</li>
</ul>

<hr>

<h2>📄 License Information</h2>
<p>Released under <strong>MIT License</strong>. Free to use, modify, distribute, and contribute under this license.</p>

<hr>

<h2>📚 Additional Resources</h2>
<ul>
<li><a href="https://github.com/Salman-Sensei/universe-campus-platform">GitHub Repository</a></li>
<li><a href="https://vercel.com">Vercel Deployment</a></li>
<li><a href="https://supabase.com">Supabase Backend</a></li>
<li><a href="https://docs.lovable.dev">Lovable Documentation</a></li>
</ul>

<hr>

<h2>👨‍💻 Maintainer</h2>
<p>Salman Khan</p>
<p>Email: skbkhan31@gmail.com</p>
<p>LinkedIn: <a href="https://www.linkedin.com/in/salmankhan-developer/">https://www.linkedin.com/in/salmankhan-developer/</a></p>
<p>GitHub: <a href="https://github.com/Salman-Sensei">https://github.com/Salman-Sensei</a></p>

<hr>

<h2>⭐ Final Note</h2>
<p>
UniVerse is a dynamic, AI-enhanced SaaS campus network bringing stories, posts, academic collaboration, marketplaces, communities, and events into a single powerful platform. Built for students by students, it represents the future of connected campus life.
</p>
