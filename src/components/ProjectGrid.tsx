import ProjectCard from "./ProjectCards";
import { projects, ProjectProps } from "./ProjectDetails";
import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const ProjectGrid = () => {
  const projectGridRef = useRef(null);
  gsap.set(projectGridRef.current, {
    clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
  });
  gsap.to(projectGridRef.current, {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    duration: 0.5,
    ease: "power4.out",
    scrollTrigger: { trigger: projectGridRef.current },
  });
  return (
    <>
      <div
        ref={projectGridRef}
        className="grid w-full grid-cols-2 grid-rows-2 gap-y-10 gap-x-6  lg:grid-cols-2"
      >
        {projects.map((project: ProjectProps) => (
          <ProjectCard
            id={project.id}
            key={project.id}
            name={project.name}
            description={project.description}
            technologies={project.technologies}
            techNames={project.techNames}
            techLinks={project.techLinks}
            github={project.github}
            demo={project.demo}
            image={project.image}
            available={project.available}
          />
        ))}
      </div>
    </>
  );
};

export default ProjectGrid;
