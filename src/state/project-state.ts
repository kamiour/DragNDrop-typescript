namespace App {
  type Listener<T> = (items: T[]) => void;

  class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn);
    }
  }

  export class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
      super();
    }

    static getInstance() {
      if (this.instance) {
        return this.instance;
      }

      this.instance = new ProjectState();
      return this.instance;
    }

    addProject(title: string, desc: string, people: number) {
      const newProject = new Project(
        Math.random().toString(),
        title,
        desc,
        people,
        ProjectStatus.Active
      );

      this.projects.push(newProject);

      this.updateListeners();
    }

    moveProject(projectId: string, projectStatus: ProjectStatus) {
      const project = this.projects.find((project) => project.id === projectId);
      if (project && project.status !== projectStatus) {
        project.status = projectStatus;
        this.updateListeners();
      }
    }

    private updateListeners() {
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice());
      }
    }
  }

  export const projectState = ProjectState.getInstance();
}
