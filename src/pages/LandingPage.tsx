import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Timer, Flame, Trophy, Command, ArrowRight, 
  CheckCircle, XCircle, ChevronDown, ChevronUp, Rocket
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { CURRICULUM } from '../data/curriculumStats';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#060609] text-gray-100 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      
      {/* Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-white">
            {APP_CONFIG.shortName}
          </div>
          <span className="font-bold text-xl tracking-tight">{APP_CONFIG.name}</span>
        </div>
        <div className="flex gap-4">
          <Link to="/dashboard" className="text-sm font-medium hover:text-white text-gray-300 transition-colors py-2">
            Sign In
          </Link>
          <Link to="/dashboard" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Start Free
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24">
        
        {/* 1. Hero Section */}
        <motion.section 
          initial="hidden" animate="visible" variants={fadeIn}
          className="text-center max-w-4xl mx-auto pt-10 pb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-8 border border-orange-500/20">
            <Rocket className="w-4 h-4" />
            <span>Updated {CURRICULUM.totalWeeks}-Week Curriculum Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 leading-tight">
            Stop mindless grinding.<br/>Follow a system.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
            {APP_CONFIG.tagline}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:from-orange-400 hover:to-red-500 transition-all shadow-lg shadow-orange-500/25">
              Start Now — Free Forever
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/curriculum" className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gray-900 border border-gray-800 text-white font-medium text-lg hover:bg-gray-800 transition-all flex items-center justify-center">
              Explore Curriculum
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500"/> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500"/> Browser-based</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500"/> 100% private</span>
          </div>
        </motion.section>

        {/* 2. Stats Bar */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-y border-gray-800/50 py-10 my-20"
        >
          {[
            { value: CURRICULUM.totalProblems, label: 'Curated Problems' },
            { value: CURRICULUM.totalWeeks, label: 'Structured Weeks' },
            { value: CURRICULUM.totalDays, label: 'Focused Days' },
            { value: CURRICULUM.top150Count, label: 'Interview Essentials' }
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeIn} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.section>

        {/* 3. Pain vs System Section */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="py-20"
        >
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6" /> The Old Way
              </h3>
              <ul className="space-y-4">
                {['Random problem grinding', 'Forgetting patterns after a week', 'Inconsistent study habits', 'No tracking or accountability'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400">
                    <XCircle className="w-5 h-5 text-red-500/50 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px]" />
              <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2 relative z-10">
                <CheckCircle className="w-6 h-6" /> The GrindOS Way
              </h3>
              <ul className="space-y-4 relative z-10">
                {['Phased curriculum with daily targets', 'Spaced repetition review days', 'Streak tracking with rest day scheduling', 'Full analytics and progress visualization'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 4. Features Bento Grid */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="py-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Everything you need to succeed.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {/* Feature 1 */}
            <div className="md:col-span-2 bg-[#0a0a0f] border border-gray-800/80 rounded-2xl p-8 hover:border-gray-700 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen className="w-32 h-32" />
              </div>
              <BookOpen className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Phased Curriculum</h3>
              <p className="text-gray-400">5 phases from arrays to system design. A structured path so you never have to guess what to study next.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-[#0a0a0f] border border-gray-800/80 rounded-2xl p-8 hover:border-gray-700 transition-all group overflow-hidden relative">
              <Timer className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Focus Timer</h3>
              <p className="text-gray-400">Built-in Pomodoro with audio cues.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-[#0a0a0f] border border-gray-800/80 rounded-2xl p-8 hover:border-gray-700 transition-all group overflow-hidden relative">
              <Flame className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Streak Engine</h3>
              <p className="text-gray-400">Don't break the chain. Smart rest day handling.</p>
            </div>
            {/* Feature 4 */}
            <div className="md:col-span-2 bg-[#0a0a0f] border border-gray-800/80 rounded-2xl p-8 hover:border-gray-700 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy className="w-32 h-32" />
              </div>
              <Trophy className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Interview 150 Track</h3>
              <p className="text-gray-400">Full coverage of top interview patterns. Toggle between the full curriculum and the essential 150 at any time.</p>
            </div>
            {/* Feature 5 */}
            <div className="md:col-span-3 bg-gradient-to-r from-[#0a0a0f] to-[#12121a] border border-gray-800/80 rounded-2xl p-8 hover:border-gray-700 transition-all flex items-center justify-between">
              <div>
                <Command className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Command Palette</h3>
                <p className="text-gray-400">Press <kbd className="bg-gray-800 px-2 py-1 rounded text-sm text-gray-300 ml-1">Ctrl+K</kbd> to search any problem instantly.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 5. Curriculum Preview Section */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="py-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">The Journey Ahead</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { phase: 'Weeks 1-4', title: 'Linear Foundations', desc: 'Arrays, Strings, Hash Maps, Pointers' },
              { phase: 'Weeks 5-9', title: 'Trees & Graphs', desc: 'Binary Trees, BSTs, Traversals, Matrices' },
              { phase: 'Weeks 10-13', title: 'Dynamic Programming', desc: '1D/2D DP, Memoization, Tabulation' },
              { phase: 'Week 14', title: 'System Design', desc: 'Scalability, Databases, Architecture' },
              { phase: 'Weeks 15-20', title: 'Mock Interviews & Sprint', desc: 'Full-length mocks, mixed pattern review' },
            ].map((phase, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 bg-[#0a0a0f] border border-gray-800/50 p-6 rounded-xl hover:border-orange-500/30 transition-colors">
                <div className="sm:w-1/4 font-bold text-orange-400">{phase.phase}</div>
                <div className="sm:w-3/4">
                  <h4 className="text-lg font-bold text-white mb-1">{phase.title}</h4>
                  <p className="text-gray-400 text-sm">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 6. Social Proof Section */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="py-20 bg-gray-900/30 -mx-6 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Built for engineers who ship.</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { quote: "The structured approach completely changed my prep. I actually finished the 20 weeks and landed a FAANG offer.", name: "Alex Chen", role: "Landed FAANG Offer" },
                { quote: "I went from struggling with Easy problems to consistently solving Mediums. The streak tracker kept me accountable.", name: "Sarah Jenkins", role: "Junior Developer" },
                { quote: "As a career switcher, I didn't know what to focus on. GrindOS gave me the exact roadmap I needed.", name: "Marcus Johnson", role: "Career Switcher" },
              ].map((t, i) => (
                <div key={i} className="bg-[#0a0a0f] border border-gray-800/80 p-6 rounded-2xl flex flex-col justify-between">
                  <p className="text-gray-300 italic mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800" />
                    <div>
                      <div className="font-bold text-sm text-white">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 7. FAQ Section */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="py-20 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FAQItem 
              q="How is this different from just using LeetCode?" 
              a="GrindOS is an opinionated system. Instead of picking random problems, you follow a curated 20-week phased curriculum with built-in spaced repetition and rest days." 
            />
            <FAQItem 
              q="What if my interview is in 4 weeks?" 
              a="You can use the 'Interview 150' filter to focus only on the absolute essentials, skipping the extended practice problems to fast-track your prep." 
            />
            <FAQItem 
              q="Is my data private?" 
              a="100% private. GrindOS is a local-first application. All your progress, notes, and settings are stored locally in your browser. Nothing is sent to our servers." 
            />
            <FAQItem 
              q="Is it really free?" 
              a="The core tracking, curriculum, and analytics are free forever. No credit card required." 
            />
            <FAQItem 
              q="Can I customize the schedule?" 
              a="Yes! You can configure your designated rest day, start date, and target deadline. The system adjusts automatically." 
            />
          </div>
        </motion.section>

        {/* 8. Final CTA + Footer */}
        <motion.section 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
          className="py-32 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-white">Your next offer starts with Day 1.</h2>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-white text-black font-bold text-xl hover:bg-gray-200 transition-all shadow-xl shadow-white/10">
            Launch {APP_CONFIG.name}
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.section>

      </main>
      
      <footer className="border-t border-gray-800/50 py-8 text-center text-sm text-gray-600 bg-[#040406]">
        <p>© {new Date().getFullYear()} {APP_CONFIG.name}. Built with discipline.</p>
      </footer>
    </div>
  );
};

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-800/80 rounded-xl overflow-hidden bg-[#0a0a0f]">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-center justify-between p-5 text-left font-medium text-gray-200 hover:bg-gray-800/50 transition-colors"
      >
        <span>{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 text-gray-400 border-t border-gray-800/50 mt-2">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
