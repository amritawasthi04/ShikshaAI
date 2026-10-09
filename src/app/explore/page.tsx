"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { roadmapService } from "@/services/roadmapService";
import { GeneratedRoadmap, ExploreResource } from "@/types/roadmap";
import { exploreResourcesData } from "@/data/exploreResources";
import { ResourceDetailModal } from "@/components/explore/ResourceDetailModal";
import {
  Search,
  ArrowRight,
  Sparkles,
  BookOpen,
  Clock,
  Layers,
  Filter,
  Plus,
  Check,
  Code2,
  Terminal,
  FileCheck,
  Target,
  ExternalLink,
  Eye,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ExploreContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [activeRoadmap, setActiveRoadmap] = useState<GeneratedRoadmap | null>(() => {
    return roadmapService.getDefaultRoadmap();
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [addedResourceIds, setAddedResourceIds] = useState<Set<string>>(new Set());

  // Modal State
  const [selectedResource, setSelectedResource] = useState<ExploreResource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  // Sync added resources set with active roadmap on mount
  useEffect(() => {
    const rdm = roadmapService.getActiveRoadmap();
    if (rdm) {
      setActiveRoadmap(rdm);
      const inPathSet = new Set<string>();
      rdm.phases.forEach((p) => {
        p.lessons.forEach((l) => {
          inPathSet.add(l.id);
          inPathSet.add(l.id.replace("usr_res_", ""));
          inPathSet.add(l.title.toLowerCase());
        });
      });
      setAddedResourceIds(inPathSet);
    }
  }, []);

  const categories = [
    "All",
    "Technologies",
    "Learning Paths",
    "Tutorials",
    "Projects",
  ];

  const difficultyLevels = ["All", "Beginner", "Intermediate", "Advanced"];

  // Helper to generate contextual match reason based on student's active roadmap
  const getMatchReason = (resource: ExploreResource): string => {
    if (!activeRoadmap) {
      return "Curated foundation curriculum resource.";
    }

    const targetRole = (activeRoadmap.targetRole || activeRoadmap.title || "").toLowerCase();
    const knownSkills = (activeRoadmap.knownSkills || []).map((s) => s.toLowerCase());

    // 1. Direct Target Role Match
    const matchesRole = resource.targetRoles.some((role) =>
      targetRole.includes(role.toLowerCase()) || role.toLowerCase().includes(targetRole)
    );
    if (matchesRole) {
      return `Direct Match: Aligned with your target role as ${activeRoadmap.targetRole || "Software Engineer"}.`;
    }

    // 2. Skill Gap Bridge
    const gapSkill = resource.skillFocus.find((s) => !knownSkills.includes(s.toLowerCase()));
    if (gapSkill) {
      return `Bridges Skill Gap: Covers ${gapSkill} to accelerate your progress toward full-stack competence.`;
    }

    // 3. Known Skill Expansion
    const knownMatch = resource.skillFocus.find((s) => knownSkills.includes(s.toLowerCase()));
    if (knownMatch) {
      return `Deepens Skill: Builds advanced patterns upon your existing ${knownMatch} knowledge.`;
    }

    return `Recommended milestone for your ${activeRoadmap.experienceLevel || "Intermediate"} curriculum track.`;
  };

  // Check if resource is already in active roadmap
  const checkIsAlreadyAdded = (resource: ExploreResource): boolean => {
    return (
      addedResourceIds.has(resource.id) ||
      addedResourceIds.has(resource.id.replace("usr_res_", "")) ||
      addedResourceIds.has(resource.title.toLowerCase())
    );
  };

  // Add Resource to Path Handler
  const handleAddToPath = (resource: ExploreResource) => {
    if (checkIsAlreadyAdded(resource)) return;

    const res = roadmapService.addResourceToRoadmap({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      duration: resource.duration,
      resourceType: resource.resourceType,
      objectives: resource.objectives,
      externalUrl: resource.externalUrl,
      codePreview: resource.codePreview,
    });

    if (res.success) {
      setActiveRoadmap({ ...res.roadmap });
      setAddedResourceIds((prev) => {
        const next = new Set(prev);
        next.add(resource.id);
        next.add(resource.title.toLowerCase());
        return next;
      });

      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleOpenDetailModal = (resource: ExploreResource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  // Filter resources
  const filteredResources = exploreResourcesData.filter((res) => {
    const matchesCategory =
      selectedCategory === "All" || res.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "All" || res.difficulty === selectedDifficulty;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      res.title.toLowerCase().includes(query) ||
      res.description.toLowerCase().includes(query) ||
      res.tags.some((t) => t.toLowerCase().includes(query)) ||
      res.targetRoles.some((r) => r.toLowerCase().includes(query)) ||
      res.skillFocus.some((s) => s.toLowerCase().includes(query));

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Projects":
        return <Sparkles size={13} className="text-[#54252C]" />;
      case "Tutorials":
        return <Code2 size={13} className="text-[#54252C]" />;
      case "Technologies":
        return <Terminal size={13} className="text-[#54252C]" />;
      case "Learning Paths":
      default:
        return <BookOpen size={13} className="text-[#54252C]" />;
    }
  };

  return (
    <AppLayout
      pageTitle="Explore Resources & Roadmaps"
      pageSubtitle="Discover structured learning tracks, deep-dive tutorials, technologies, and real-world projects."
      actionElement={
        <Link
          href="/build-path"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs sm:text-sm font-medium transition-colors shadow-2xs"
        >
          <Sparkles size={15} className="text-[#D8C8BA]" />
          <span>Build Custom Path</span>
        </Link>
      }
    >
      {/* Toast Confirmation Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-[8px] bg-[#54252C] text-[#F6F1E9] text-xs sm:text-sm flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-[#D8C8BA]" />
              <span>{toastMessage}</span>
            </div>
            <Link
              href="/learning-path"
              className="text-xs font-semibold underline text-[#D8C8BA] hover:text-[#F6F1E9] ml-4"
            >
              View in Learning Path →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#292827]/50"
          />
          <input
            type="text"
            placeholder="Search by topic, technology (e.g. Next.js, PostgreSQL, PyTorch), or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F6F1E9] text-[#292827] placeholder:text-[#292827]/40 text-sm rounded-[8px] border border-[#D8C8BA] pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#54252C] focus:ring-1 focus:ring-[#54252C] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#292827]/40 hover:text-[#292827]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Difficulty Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#292827]/70 whitespace-nowrap">
            Difficulty:
          </span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#F6F1E9] text-[#292827] text-xs rounded-[6px] border border-[#D8C8BA] px-3 py-2 focus:outline-none focus:border-[#54252C]"
          >
            {difficultyLevels.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-[#D8C8BA] no-scrollbar">
        {categories.map((cat) => {
          const count =
            cat === "All"
              ? exploreResourcesData.length
              : exploreResourcesData.filter((r) => r.category === cat).length;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-[6px] text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? "bg-[#54252C] text-[#F6F1E9]"
                  : "bg-[#F6F1E9] border border-[#D8C8BA] text-[#292827]/80 hover:border-[#54252C]"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[0.65rem] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat
                    ? "bg-[#F6F1E9]/20 text-[#F6F1E9]"
                    : "bg-[#D8C8BA]/50 text-[#292827]/70"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between mb-6 text-xs text-[#292827]/70">
        <span>
          Showing <strong>{filteredResources.length}</strong> resources
        </span>
        {activeRoadmap && (
          <span className="hidden sm:inline-block">
            Targeting: <strong>{activeRoadmap.targetRole || activeRoadmap.title}</strong>
          </span>
        )}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="p-12 text-center rounded-[10px] border border-dashed border-[#D8C8BA] bg-[#F6F1E9] my-8">
          <div className="w-12 h-12 rounded-full bg-[#54252C]/10 text-[#54252C] flex items-center justify-center mx-auto mb-3">
            <Search size={20} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-[#292827] mb-1">
            No resources found matching &quot;{searchQuery}&quot;
          </h3>
          <p className="text-xs sm:text-sm text-[#292827]/70 mb-4">
            Try adjusting your search terms, changing the category, or resetting filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedDifficulty("All");
            }}
            className="px-4 py-2 rounded-[6px] bg-[#54252C] text-[#F6F1E9] text-xs font-medium hover:bg-[#803F47] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Grid of Explore Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredResources.map((res) => {
          const isAdded = checkIsAlreadyAdded(res);
          const matchReason = getMatchReason(res);

          return (
            <motion.div
              key={res.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`p-6 rounded-[10px] border bg-[#F6F1E9] flex flex-col justify-between group ${
                isAdded
                  ? "border-[#54252C]/50 shadow-2xs"
                  : "border-[#D8C8BA] hover:border-[#54252C] shadow-2xs"
              }`}
            >
              <div>
                {/* Header Meta: Category + Difficulty + Duration */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[0.7rem] font-semibold px-2 py-0.5 rounded-[4px] bg-[#54252C]/10 text-[#54252C] uppercase tracking-wider">
                    {getCategoryIcon(res.category)}
                    <span>{res.category}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[0.7rem] px-1.5 py-0.5 rounded-[3px] border border-[#D8C8BA] text-[#292827]/70 font-medium">
                      {res.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-[#292827]/60">
                      <Clock size={11} />
                      <span>{res.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Match Reason Badge */}
                <div className="mb-3 p-2 rounded-[6px] bg-[#54252C]/5 border border-[#54252C]/15 flex items-start gap-1.5">
                  <Target size={12} className="text-[#54252C] flex-shrink-0 mt-0.5" />
                  <p className="text-[0.7rem] text-[#292827] leading-snug">
                    {matchReason}
                  </p>
                </div>

                {/* Title */}
                <h3
                  onClick={() => handleOpenDetailModal(res)}
                  className="font-serif text-lg font-semibold text-[#292827] group-hover:text-[#54252C] cursor-pointer transition-colors mb-2"
                >
                  {res.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#292827]/75 leading-relaxed mb-4 line-clamp-3">
                  {res.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {res.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.65rem] px-2 py-0.5 rounded-[3px] border border-[#D8C8BA] text-[#292827]/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="pt-4 border-t border-[#D8C8BA]/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetailModal(res)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#292827]/80 hover:text-[#54252C] transition-colors"
                >
                  <Eye size={13} />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-2">
                  {isAdded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#54252C]/10 text-[#54252C] text-xs font-semibold">
                      <Check size={12} strokeWidth={2.5} />
                      <span>In Path</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddToPath(res)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] bg-[#54252C] hover:bg-[#803F47] text-[#F6F1E9] text-xs font-medium transition-colors shadow-2xs"
                    >
                      <Plus size={13} />
                      <span>Add to Path</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToPath={handleAddToPath}
        isAlreadyAdded={selectedResource ? checkIsAlreadyAdded(selectedResource) : false}
        matchReason={selectedResource ? getMatchReason(selectedResource) : undefined}
      />
    </AppLayout>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <AppLayout
          pageTitle="Explore Learning Roadmaps & Resources"
          pageSubtitle="Discover curated curriculum tracks, tutorials, and project blueprints."
        >
          <div className="p-12 text-center text-sm text-[#292827]/70">
            Loading resources...
          </div>
        </AppLayout>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

