import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

// Maps static schema keys to their human-readable names used in the dynamic features array.
// Values can be a string OR an array of strings (aliases) — admin may name features differently.
const DYNAMIC_FEATURE_NAMES = {
  hasResumeBuilder:          'Resume Builder',
  hasProfileBoost:           'Profile Boost',
  hasProfileViewInsights:    'Profile View Insights',
  hasMessageRecruiters:      ['Message Recruiters', 'Direct Messaging', 'Messages', 'Messaging'],
  hasRequests:               ['Requests', 'Assigned Requests'],
  hasCareerCounselling:      'Career Counselling',
  hasMockInterviews:         ['Mock Interviews', 'Mock Interview'],
  hasPriorityBadge:          'Priority Badge',
  hasAiResumeReview:         ['AI Resume Review', 'AI Resume'],
  hasATSPipeline:            ['ATS Pipeline', 'ATS'],
  hasAnalyticsDashboard:     ['Analytics Dashboard', 'Analytics'],
  hasCandidateDBExport:      ['Candidate DB Export', 'Candidate DB export', 'DB Export'],
  hasBulkMessaging:          ['Bulk Messaging', 'Bulk Message'],
  hasVideoInterview:         ['Video Interview', 'Video interview'],
  hasPriorityListing:        ['Priority Listing', 'Priority'],
  hasAICandidateMatching:    ['AI Candidate Matching', 'AI candidate matching', 'AI Matching'],
  hasTeamCollaboration:      ['Team Collaboration', 'Team'],
  hasDedicatedOnboarding:    ['Dedicated Onboarding', 'Onboarding'],
  hasJobMatchAnalysis:       ['Job Match Analysis', 'Skill Gap Analysis', 'Job Match'],
};

const FREE_TIER_DEFAULTS = {
  jobseeker: {
    hasResumeBuilder: true,
    resumeBuilderCount: 1,
    jobAlerts: 'Monthly',
    hasMessageRecruiters: true,
    messageRecruitersCount: 1,
    hasCareerCounselling: true,
    careerCounsellingCount: 0,
  },
  recruiter: {
    activeJobPostings: 2,
    candidateSearchPerDay: 10,
    userSeats: 1,
    companyProfileType: 'Basic'
  },
  company: {
    activeJobPostings: 2,
    candidateSearchPerDay: 10,
    userSeats: 1,
    companyProfileType: 'Basic'
  }
};

/**
 * Checks if a specific feature key is active on the user's subscription.
 * Checks both static schema fields and the dynamic features[] array.
 */
const hasFeatureCore = (user, featureKey) => {
  if (user?.role === 'admin' || user?.role === 'subadmin') return true;

  if (featureKey === 'hasAICandidateMatching') {
    if (user?.aiMatchedJobs && user.aiMatchedJobs.length > 0) return true;
  }

  // Custom logic for Candidate DB Export limit
  if (featureKey === 'hasCandidateDBExport') {
    // 1. Check user.purchasedFeatures (Pay Per System)
    if (Array.isArray(user?.purchasedFeatures) && user.purchasedFeatures.length > 0) {
      const now = new Date();
      const purchasedMatch = user.purchasedFeatures.find(
        f => f.featureKey === 'hasCandidateDBExport' && 
             f.isActive && 
             f.usageLeft > 0 && 
             (!f.expiresAt || new Date(f.expiresAt) > now)
      );
      if (purchasedMatch) return true;
    }

    // 2. Check subscription plan
    let plan = user?.subscription;
    if (!plan || (plan.price !== 0 && plan.duration !== 'Lifetime' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date())) {
      plan = FREE_TIER_DEFAULTS[user?.role] || {};
    }
    
    let planHasExport = false;
    const val = plan[featureKey];
    if (val === true) {
      planHasExport = true;
    } else if (Array.isArray(plan.features) && plan.features.length > 0) {
      const dynamicEntry = DYNAMIC_FEATURE_NAMES[featureKey];
      if (dynamicEntry) {
        const aliases = Array.isArray(dynamicEntry) ? dynamicEntry : [dynamicEntry];
        planHasExport = plan.features.some(
          f => f.isActive && aliases.some(alias => f.name?.toLowerCase() === alias.toLowerCase())
        );
      }
    }

    if (planHasExport) {
      const used = user?.candidateDBExportsUsed || 0;
      if (used < 1) return true;
    }

    return false;
  }

  let plan = user?.subscription;

  // Expired subscription — fallback to free tier defaults
  if (!plan || (plan.price !== 0 && plan.duration !== 'Lifetime' && user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date())) {
    plan = FREE_TIER_DEFAULTS[user?.role] || {};
  }

  // Custom logic for Team Collaboration based on seats
  if (featureKey === 'hasTeamCollaboration' && plan.userSeats > 1) return true;

  // 1. Check static schema field — only short-circuit on truthy values.
  // A static `false` falls through so the dynamic features[] can still grant access.
  const val = plan[featureKey];
  if (val !== undefined && val !== null) {
    if (typeof val === 'boolean') {
      if (val === true) return true;
      // val === false → fall through to dynamic check below
    } else if (typeof val === 'number') {
      if (val >= 0) return true; // 0 = unlimited = enabled; positive = N uses = enabled
    } else if (typeof val === 'string') {
      if (val !== 'none' && val !== '' && val !== 'None') return true;
    }
  }

  // 2. Fallback: check dynamic features[] array (admin may have set it there)
  if (Array.isArray(plan.features) && plan.features.length > 0) {
    const dynamicEntry = DYNAMIC_FEATURE_NAMES[featureKey];
    if (dynamicEntry) {
      const aliases = Array.isArray(dynamicEntry) ? dynamicEntry : [dynamicEntry];
      const dynMatch = plan.features.find(
        f => f.isActive && aliases.some(alias => f.name?.toLowerCase() === alias.toLowerCase())
      );
      if (dynMatch) return true;
    }
  }

  // 3. Fallback: check user.purchasedFeatures (Pay Per System)
  if (Array.isArray(user?.purchasedFeatures) && user.purchasedFeatures.length > 0) {
    const now = new Date();
    const purchasedMatch = user.purchasedFeatures.find(
      f => f.featureKey === featureKey && 
           f.isActive && 
           (!f.expiresAt || new Date(f.expiresAt) > now)
    );
    if (purchasedMatch) return true;
  }

  return false;
};

export const hasFeature = (user, featureKey) => {
  if (featureKey === 'hasVideoInterview' || featureKey === 'hasInterviewScheduling') {
    return hasFeatureCore(user, 'hasVideoInterview') || hasFeatureCore(user, 'hasInterviewScheduling');
  }
  return hasFeatureCore(user, featureKey);
};

const PERKS = {
  hasResumeBuilder:         ['Professional AI-powered templates', 'ATS-optimized formatting', 'Download as PDF/Word', 'Real-time feedback'],
  jobAlerts:                ['Instant / daily / weekly digest', 'Keyword + location filters', 'Role & salary alerts', 'Never miss an opening'],
  hasProfileViewInsights:   ['See who viewed your profile', 'Company & role of viewers', 'Daily view trend chart', 'Boost visibility stats'],
  hasMessageRecruiters:     ['Direct chat with hiring managers', 'Read receipts & status', 'Attach resume inline', 'Conversation history'],
  hasCareerCounselling:     ['1-on-1 expert sessions', 'Career path roadmapping', 'Resume & LinkedIn review', 'Negotiation coaching'],
  hasMockInterviews:        ['AI mock interviews', 'Role-specific question bank', 'Video recording & playback', 'Instant feedback'],
  hasATSPipeline:           ['Visual Kanban pipeline', 'Automated stage triggers', 'Bulk status updates', 'Pipeline analytics'],
  hasAnalyticsDashboard:    ['Job post performance', 'Candidate funnel metrics', 'Time-to-hire tracking', 'Source attribution'],
  hasCandidateDBExport:     ['Export to CSV / Excel', 'Bulk profile download', 'Filter before export', 'Scheduled exports'],
  hasBulkMessaging:         ['Message up to 500 candidates', 'Template library', 'Open-rate analytics', 'Personalization tokens'],
  hasVideoInterview:        ['Schedule video interviews', 'Invite candidates via meeting link', 'Track interview status', 'Manage upcoming interviews'],
  hasPriorityListing:       ['Golden star badge on all job cards', 'Jobs listed at top of search results', 'Highlighted as Priority Hiring Partner', 'Increased candidate visibility'],
  hasAICandidateMatching:   ['AI-scored candidate ranking', 'Skills + experience matching', 'Location & job type fit analysis', 'Sorted by match percentage'],
  hasTeamCollaboration:     ['Shared job pipelines', 'Role-based permissions', 'Internal notes & tags', 'Activity feed'],
  hasInterviewScheduling:   ['Calendar sync (Google/Outlook)', 'Auto-reminders', 'Self-schedule links', 'Interviewer availability'],
  hasDedicatedOnboarding:   ['Dedicated success manager', 'Custom onboarding plan', 'Priority support queue', 'Training sessions'],
  hasAiResumeReview:        ['AI-powered feedback', 'ATS compatibility score', 'Section-by-section analysis', 'Improvement suggestions'],
};

const NAMES = {
  hasResumeBuilder: 'Resume Builder',
  jobAlerts: 'Job Alerts',
  hasProfileViewInsights: 'Profile Insights',
  hasMessageRecruiters: 'Direct Messaging',
  hasCareerCounselling: 'Career Counselling',
  hasMockInterviews: 'Mock Interviews',
  hasATSPipeline: 'ATS Pipeline',
  hasAnalyticsDashboard: 'Analytics Dashboard',
  hasCandidateDBExport: 'Candidate Export',
  hasBulkMessaging: 'Bulk Messaging',
  hasVideoInterview: 'Video Interview',
  hasPriorityListing: 'Priority Listing',
  hasAICandidateMatching: 'AI Candidate Matching',
  hasTeamCollaboration: 'Team Collaboration',
  hasInterviewScheduling: 'Interview Scheduling',
  hasDedicatedOnboarding: 'Dedicated Onboarding',
  hasAiResumeReview: 'AI Resume Review',
  hasRequests: 'Service Requests',
  hasMessaging: 'Premium Messaging',
};

const LockedScreen = ({ featureKey, featureName, description, subscriptionPath }) => {
  const perks = PERKS[featureKey] || [];
  const name = featureName || NAMES[featureKey] || 'This Feature';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md text-center">
        {/* Lock Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <Lock size={11} />
          Premium Feature
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
          <Lock size={24} className="text-white" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">{name}</h2>
        {description && (
          <p className="text-sm text-slate-500 font-medium mb-7 leading-relaxed">{description}</p>
        )}

        {/* Perks */}
        {perks.length > 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-7 text-left space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">What you'll unlock</p>
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                <span className="text-xs font-medium text-slate-700">{p}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link to={subscriptionPath || '/candidate/subscription'}>
          <Button className="h-11 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 gap-2">
            <Sparkles size={15} />
            Upgrade to Unlock
            <ArrowRight size={14} />
          </Button>
        </Link>

        <p className="text-[11px] text-slate-400 font-medium mt-4">
          Already have a plan? Your feature may not be included — check your{' '}
          <Link to={subscriptionPath || '/candidate/subscription'} className="text-emerald-600 hover:underline">
            subscription settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

/**
 * Wraps feature content with a subscription gate.
 * Shows upgrade wall if the feature is not active on the user's plan.
 *
 * @param featureKey   - The plan field key e.g. 'hasResumeBuilder'
 * @param featureName  - Human-readable name (optional, derived from featureKey if absent)
 * @param description  - Short description shown on the lock screen
 * @param subscriptionPath - Path to the subscription page (default: /candidate/subscription)
 * @param children     - Rendered when feature is active
 */
const FeatureGate = ({ featureKey, featureName, description, subscriptionPath, children }) => {
  const { user } = useAuth();

  if (!hasFeature(user, featureKey)) {
    return (
      <LockedScreen
        featureKey={featureKey}
        featureName={featureName}
        description={description}
        subscriptionPath={subscriptionPath}
      />
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
