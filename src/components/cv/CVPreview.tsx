import type { CV, UserProfile, CVEntry } from "@/types";

interface CVPreviewProps {
  cv: CV;
  user?: UserProfile | null;
}

export default function CVPreview({ cv, user }: CVPreviewProps) {
  const { sections, customization, templateId } = cv;

  const personalInfoSection = sections.find((s) => s.type === "personalInfo");
  const personalInfo = personalInfoSection?.entries[0] as
    | {
        fullName?: string;
        email?: string;
        phone?: string;
        location?: string;
        website?: string;
        linkedin?: string;
      }
    | undefined;

  const summarySection = sections.find((s) => s.type === "summary");
  const summary = summarySection?.entries[0] as
    | { content?: string }
    | undefined;

  const experienceSection = sections.find((s) => s.type === "experience");
  const educationSection = sections.find((s) => s.type === "education");
  const skillsSection = sections.find((s) => s.type === "skills");
  const certificationsSection = sections.find(
    (s) => s.type === "certifications",
  );
  const projectsSection = sections.find((s) => s.type === "projects");
  const languagesSection = sections.find((s) => s.type === "languages");
  const referencesSection = sections.find((s) => s.type === "references");

  const styles = {
    "--primary": customization.primaryColor,
    "--secondary": customization.secondaryColor,
    "--accent": customization.accentColor,
  } as React.CSSProperties;

  const renderTemplate = () => {
    switch (templateId) {
      case "modern":
        return renderModernTemplate();
      case "minimal":
        return renderMinimalTemplate();
      case "executive":
        return renderExecutiveTemplate();
      case "creative":
        return renderCreativeTemplate();
      case "tech":
        return renderTechTemplate();
      case "academic":
        return renderAcademicTemplate();
      default:
        return renderClassicTemplate();
    }
  };

  const renderClassicTemplate = () => (
    <div
      className="bg-white shadow-lg w-full max-w-[800px] min-h-[1131px] p-8"
      style={styles}
    >
      <header
        className="text-center mb-6 pb-4 border-b-2"
        style={{ borderColor: customization.primaryColor }}
      >
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: customization.headingFont,
            color: customization.secondaryColor,
          }}
        >
          {personalInfo?.fullName || "Your Name"}
        </h1>
        <div
          className="flex justify-center gap-4 text-sm"
          style={{ color: customization.primaryColor }}
        >
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo?.location && <span>• {personalInfo.location}</span>}
        </div>
      </header>

      {summary?.content && (
        <section className="mb-4">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-2 pb-1 border-b"
            style={{
              borderColor: customization.accentColor,
              color: customization.secondaryColor,
            }}
          >
            Professional Summary
          </h2>
          <p className="text-sm" style={{ fontFamily: customization.bodyFont }}>
            {summary.content}
          </p>
        </section>
      )}

      {experienceSection &&
        experienceSection.entries &&
        experienceSection.entries.length > 0 && (
          <section className="mb-4">
            <h2
              className="text-lg font-bold uppercase tracking-wider mb-2 pb-1 border-b"
              style={{
                borderColor: customization.accentColor,
                color: customization.secondaryColor,
              }}
            >
              Work Experience
            </h2>
            {experienceSection.entries.map((exp, i) => {
              const e = exp as {
                company?: string;
                position?: string;
                startDate?: string;
                endDate?: string;
                current?: boolean;
                description?: string;
              };
              return (
                <div key={i} className="mb-3">
                  <div className="flex justify-between">
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: customization.secondaryColor }}
                      >
                        {e.position}
                      </h3>
                      <p style={{ color: customization.primaryColor }}>
                        {e.company}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {e.startDate} - {e.current ? "Present" : e.endDate}
                    </span>
                  </div>
                  {e.description && (
                    <p className="text-sm mt-1">{e.description}</p>
                  )}
                </div>
              );
            })}
          </section>
        )}

      {skillsSection?.entries && skillsSection.entries.length > 0 && (
        <section className="mb-4">
          <h2
            className="text-lg font-bold uppercase tracking-wider mb-2 pb-1 border-b"
            style={{
              borderColor: customization.accentColor,
              color: customization.secondaryColor,
            }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skillsSection.entries.map((skill, i) => {
              const s = skill as { category?: string; skills?: string[] };
              return s.skills?.map((skillName, j) => (
                <span
                  key={`${i}-${j}`}
                  className="px-2 py-1 bg-gray-100 rounded text-sm"
                >
                  {skillName}
                </span>
              ));
            })}
          </div>
        </section>
      )}

      <div className="text-center text-xs text-gray-400 mt-8">
        Powered by MyDocuments
      </div>
    </div>
  );

  const renderModernTemplate = () => (
    <div
      className="bg-white shadow-lg w-full max-w-[800px] min-h-[1131px] flex"
      style={styles}
    >
      <div className="w-1/3 bg-gray-900 p-6 text-white">
        <div className="w-32 h-32 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-xl font-bold text-center mb-4">
          {personalInfo?.fullName || "Your Name"}
        </h2>
        <div className="text-sm space-y-2">
          {personalInfo?.email && <p>{personalInfo.email}</p>}
          {personalInfo?.phone && <p>{personalInfo.phone}</p>}
          {personalInfo?.location && <p>{personalInfo.location}</p>}
        </div>

        {skillsSection?.entries && skillsSection.entries.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold mb-2 text-lg">Skills</h3>
            {skillsSection.entries.map((skill, i) => {
              const s = skill as { category?: string; skills?: string[] };
              return s.skills?.map((skillName, j) => (
                <p key={`${i}-${j}`} className="text-sm mb-1">
                  • {skillName}
                </p>
              ));
            })}
          </div>
        )}
      </div>

      <div className="w-2/3 p-6">
        {summary?.content && (
          <section className="mb-6">
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: customization.primaryColor }}
            >
              About
            </h2>
            <p className="text-sm">{summary.content}</p>
          </section>
        )}

        {experienceSection &&
          experienceSection.entries &&
          experienceSection.entries.length > 0 && (
            <section className="mb-6">
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: customization.primaryColor }}
              >
                Experience
              </h2>
              {experienceSection.entries.map((exp, i) => {
                const e = exp as {
                  company?: string;
                  position?: string;
                  startDate?: string;
                  endDate?: string;
                  current?: boolean;
                  description?: string;
                };
                return (
                  <div key={i} className="mb-3">
                    <h3 className="font-semibold">{e.position}</h3>
                    <p style={{ color: customization.primaryColor }}>
                      {e.company}
                    </p>
                    <p className="text-sm text-gray-500">
                      {e.startDate} - {e.current ? "Present" : e.endDate}
                    </p>
                    {e.description && (
                      <p className="text-sm mt-1">{e.description}</p>
                    )}
                  </div>
                );
              })}
            </section>
          )}
      </div>
    </div>
  );

  const renderMinimalTemplate = () => (
    <div
      className="bg-white shadow-lg w-full max-w-[800px] min-h-[1131px] p-12"
      style={styles}
    >
      <h1
        className="text-4xl font-light mb-4"
        style={{ color: customization.secondaryColor }}
      >
        {personalInfo?.fullName || "Your Name"}
      </h1>
      <p className="text-lg mb-8" style={{ color: customization.primaryColor }}>
        {personalInfo?.email} {personalInfo?.phone && `• ${personalInfo.phone}`}
      </p>

      {summary?.content && (
        <section className="mb-8">
          <p className="text-base leading-relaxed">{summary.content}</p>
        </section>
      )}

      {experienceSection &&
        experienceSection.entries &&
        experienceSection.entries.length > 0 && (
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: customization.secondaryColor }}
            >
              Experience
            </h2>
            {experienceSection.entries.map((exp, i) => {
              const e = exp as {
                company?: string;
                position?: string;
                startDate?: string;
                endDate?: string;
                current?: boolean;
                description?: string;
              };
              return (
                <div key={i} className="mb-4">
                  <h3 className="font-medium">
                    {e.position} at {e.company}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {e.startDate} - {e.current ? "Present" : e.endDate}
                  </p>
                  {e.description && (
                    <p className="text-sm mt-1">{e.description}</p>
                  )}
                </div>
              );
            })}
          </section>
        )}
    </div>
  );

  const renderExecutiveTemplate = () => renderClassicTemplate();
  const renderCreativeTemplate = () => renderModernTemplate();
  const renderTechTemplate = () => renderClassicTemplate();
  const renderAcademicTemplate = () => renderClassicTemplate();

  return (
    <div className="flex justify-center p-4 bg-gray-100 min-h-screen">
      {renderTemplate()}
    </div>
  );
}
