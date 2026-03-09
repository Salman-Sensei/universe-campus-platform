<h1 align="center">🌌 UniVerse Campus Platform</h1>

<h2>📖 Project Overview</h2>

<p>
<strong>UniVerse</strong> is a next-generation campus SaaS platform that combines academic collaboration, AI-driven insights, and social interaction to create a holistic student-faculty ecosystem. Built for universities and colleges, UniVerse empowers students and faculty to connect, collaborate, and leverage AI-assisted tools for learning and campus management.
</p>

<p>The platform enables users to:</p>

<ul>
<li>Share <strong>assignments, lecture notes, and study resources</strong></li>
<li>Upload and access <strong>past exams and solution manuals</strong></li>
<li>Post <strong>anonymous confessions and feedback</strong></li>
<li>Publish <strong>stories, projects, and research summaries</strong></li>
<li>Interact with AI-powered recommendations for content and learning paths</li>
<li>Faculty can manage <strong>courses, student progress, and announcements</strong></li>
<li>Track engagement and usage analytics across the campus community</li>
</ul>

<p>
UniVerse leverages a <strong>full-stack modern architecture</strong> with cloud hosting, AI services, and a responsive frontend to ensure performance, scalability, and an exceptional user experience.
</p>

<h3>Key Highlights</h3>

<ul>
<li>🔐 Secure, role-based authentication for students and faculty</li>
<li>🤖 AI-driven study recommendations and content summaries</li>
<li>📚 Comprehensive academic content sharing system</li>
<li>🗣 Anonymous feedback and confession system</li>
<li>📖 Stories, projects, and collaborative publications</li>
<li>⚡ Fast cloud deployment via Vercel</li>
<li>📱 Fully responsive and accessible modern UI</li>
<li>📊 Analytics dashboards for faculty and admins</li>
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
<li>React Query / TanStack Query for state management</li>
</ul>

<h3>Backend</h3>
<ul>
<li>Supabase (Authentication + Database + API)</li>
<li>Edge Functions for AI-powered processing</li>
<li>Node.js & Express for additional API endpoints</li>
</ul>

<h3>AI & Integrations</h3>
<ul>
<li>OpenAI GPT APIs for summarization, recommendations, and assistance</li>
<li>Third-party cloud storage for media uploads</li>
</ul>

<h3>Deployment</h3>
<ul>
<li>Vercel (Cloud Hosting & Continuous Deployment)</li>
</ul>

<h3>Development Tools</h3>
<ul>
<li>Git & GitHub</li>
<li>Node.js & npm</li>
<li>VS Code / Preferred IDE</li>
</ul>

<hr>

<h2>⚙ Installation Instructions</h2>

<h3>1️⃣ Prerequisites</h3>
<ul>
<li>Node.js v18+</li>
<li>npm or yarn</li>
<li>Git</li>
<li>Access to Supabase project credentials</li>
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

<p>Create a <code>.env</code> file and set the following:</p>

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

<p>Access the platform locally:</p>

<pre>
<code>
http://localhost:5173
</code>
</pre>

<hr>

<h2>🚀 Usage Guidelines</h2>

<p>After starting the development server:</p>

<ol>
<li>Create a student or faculty account</li>
<li>Explore content sharing, AI recommendations, and community interactions</li>
<li>Faculty can manage courses, view analytics, and publish announcements</li>
</ol>

<h3>Example Workflow</h3>

<pre>
<code>
Student registers → Logs in → Posts content or feedback → Receives AI recommendations
Faculty registers → Logs in → Publishes course materials → Monitors student engagement
</code>
</pre>

<h3>Development Commands</h3>

<ul>
<li><strong>Start dev server:</strong> <code>npm run dev</code></li>
<li><strong>Build production:</strong> <code>npm run build</code></li>
<li><strong>Preview production build:</strong> <code>npm run preview</code></li>
</ul>

<hr>

<h2>🔗 Interfaces</h2>

<h3>1️⃣ Supabase Client Interface</h3>
<p><strong>Purpose:</strong> Communication with Supabase backend</p>

<pre>
<code>supabaseClient</code>
</pre>

<p>Located in: <code>src/integrations/supabase/client.ts</code></p>

<h4>Authentication Methods</h4>

<pre>
<code>
supabase.auth.signUp({ email: string, password: string })
supabase.auth.signInWithPassword({ email: string, password: string })
supabase.auth.signOut()
</code>
</pre>

<h3>2️⃣ Database Interface</h3>

<p>CRUD operations for tables:</p>

<pre>
<code>
supabase.from("confessions").select("*")
supabase.from("confessions").insert({ content, user_id })
supabase.from("confessions").update({ content })
supabase.from("confessions").delete()
</code>
</pre>

<h3>3️⃣ AI Interface</h3>

<p>Provides AI-powered content summarization and recommendation:</p>

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
&lt;AssignmentCard title="" fileUrl="" /&gt;
&lt;StoryCard title="" content="" /&gt;
</code>
</pre>

<p>Handles rendering, user interaction, and backend integration.</p>

<hr>

<h2>🤝 Contribution Guidelines</h2>

<ol>
<li>Fork repository</li>
<li>Create branch <code>git checkout -b feature/your-feature</code></li>
<li>Implement and commit changes</li>
<li>Push branch <code>git push origin feature/your-feature</code></li>
<li>Create Pull Request</li>
</ol>

<h3>Coding Standards</h3>

<ul>
<li>Modular, reusable components</li>
<li>Consistent formatting</li>
<li>Descriptive commits</li>
<li>Proper documentation of new interfaces</li>
</ul>

<hr>

<h2>📄 License Information</h2>

<p>Released under <strong>MIT License</strong>. You may use, modify, distribute, and contribute under this license.</p>

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
UniVerse is a powerful, AI-enhanced campus SaaS platform bridging students and faculty. It combines collaboration, content sharing, and intelligent insights to create a full-fledged academic ecosystem.
</p>

<p>Contributions, suggestions, and improvements are highly encouraged!</p>
