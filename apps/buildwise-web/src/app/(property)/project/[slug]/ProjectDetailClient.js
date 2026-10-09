"use client";

import DefaultHeader from "@/components/common/DefaultHeader";
import Footer from "@/components/common/default-footer";
import MobileMenu from "@/components/common/mobile-menu";
import ProjectAboutSection from "@/components/property/project-single/ProjectAboutSection";
import ProjectDetailBreadcrumb from "@/components/property/project-single/ProjectDetailBreadcrumb";
import ProjectDetailGallery from "@/components/property/project-single/ProjectDetailGallery";
import ProjectDetailHeader from "@/components/property/project-single/ProjectDetailHeader";
import ProjectDetailShell from "@/components/property/project-single/ProjectDetailShell";
import ProjectListingContact from "@/components/property/project-single/ProjectListingContact";
import ProjectStatusBanner from "@/components/property/project-single/ProjectStatusBanner";
import ProjectUnitsSection from "@/components/property/project-single/ProjectUnitsSection";
import PsWidgetTitle from "@/components/property/property-single-style/common/PsWidgetTitle";
import {
  ProjectSingleProvider,
  useProjectSingle,
} from "@/providers/ProjectSingleProvider";

function ProjectDetailContent() {
  const { project } = useProjectSingle();

  return (
    <>
      <DefaultHeader />
      <MobileMenu />

      <ProjectDetailShell>
        <section className="pt60 pb90 bgc-f7">
          <div className="container">
            <div className="row">
              <ProjectDetailBreadcrumb />
            </div>

            <ProjectDetailHeader />

            <div className="row mt20">
              <div className="col-12">
                <ProjectStatusBanner />
              </div>
            </div>

            <ProjectDetailGallery />

            <div className="row wrap">
              <div className="col-lg-8">
                <ProjectAboutSection />
                <ProjectUnitsSection />
              </div>

              <div className="col-lg-4">
                <div className="column">
                  <div className="agen-personal-info position-relative bgc-white default-box-shadow1 bdrs12 p30 mt30 mt-lg-0">
                    <div className="widget-wrapper mb-0">
                      <PsWidgetTitle
                        icon="flaticon-call"
                        size="compact"
                        className="listing-contact-section__title"
                      >
                        Project contact
                      </PsWidgetTitle>
                      <ProjectListingContact />
                    </div>
                  </div>
                  {project?.unitCount > 0 ? (
                    <p className="fz14 text-muted mt20 mb0">
                      Questions about a specific unit? Use project contact above
                      or open a listing below.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </ProjectDetailShell>

      <section className="footer-style1 pt60 pb-0">
        <Footer />
      </section>
    </>
  );
}

export default function ProjectDetailClient({ slug }) {
  return (
    <ProjectSingleProvider slug={slug}>
      <ProjectDetailContent />
    </ProjectSingleProvider>
  );
}
