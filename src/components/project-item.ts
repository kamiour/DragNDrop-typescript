import { Draggable } from "../models/drag-drop";
import { Component } from "./base-component";
import { Project } from "../models/project";
import { AutoBind } from "../decorators/autobind";

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private project: Project;

  get persons(): string {
    if (this.project.people === 1) {
      return "1 person";
    }

    return `${this.project.people} persons`;
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent) {
    console.log("Drag end");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.innerText = this.project.title;
    this.element.querySelector("h3")!.innerText = this.persons + " assigned";
    this.element.querySelector("p")!.innerText = this.project.description;
  }
}
