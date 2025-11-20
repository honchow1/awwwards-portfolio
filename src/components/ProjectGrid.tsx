import ProjectCard from "./ProjectCards";
import { projects, ProjectProps } from "./ProjectDetails";
import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const ProjectGrid = () => {
  const projectCardRefs = useRef<React.RefObject<HTMLDivElement>[]>([]);
  projectCardRefs.current.forEach((ref) => {
    if (!ref) return;
    gsap.set(ref.current, {
      clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)",
    });
  });
  projectCardRefs.current.forEach((ref) => {
    if (!ref) return;
    gsap.to(ref.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.5,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ref.current,
      },
    });
  });
  return (
    <>
      <div className="grid w-full grid-cols-2 grid-rows-2 gap-y-10 gap-x-6  lg:grid-cols-2">
        {projects.map((project: ProjectProps) => (
          <ProjectCard
            ref={
              projectCardRefs.current[
                project.id
              ] as React.RefObject<HTMLDivElement>
            }
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
