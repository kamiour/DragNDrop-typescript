// Project State Management Class
class ProjectState {
  private listeners: any[] = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, desc: string, people: number) {
    const newProject = {
      id: Math.random().toString(),
      title: title,
      description: desc,
      people: people,
    };

    this.projects.push(newProject);

    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minlength?: number;
  maxlength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  if (
    validatableInput.minlength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minlength;
  }

  if (
    validatableInput.maxlength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxlength;
  }

  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

// AutoBind decorator
function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };

  return adjDescriptor;
}

// ProjectList Class
class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor(private type: "active" | "finished") {
    this.templateEl = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;

    this.assignedProjects = [];

    this.element = document.importNode(
      this.templateEl.content.firstElementChild! as HTMLElement,
      true
    );

    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    for (const projectItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + "PROJECTS";
  }

  private attach() {
    this.hostEl.insertAdjacentElement("beforeend", this.element);
  }
}

// ProjectInput Class
class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    this.templateEl = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;

    this.element = document.importNode(
      this.templateEl.content.firstElementChild! as HTMLFormElement,
      true
    );

    this.element.id = "user-input";

    this.titleInputEl = this.element.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputEl = this.element.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleInputEl = this.element.querySelector(
      "#people"
    )! as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private clearInputs(): void {
    this.titleInputEl.value = "";
    this.descriptionInputEl.value = "";
    this.peopleInputEl.value = "";
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputEl.value;
    const enteredDescription = this.descriptionInputEl.value;
    const enteredPeople = this.peopleInputEl.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minlength: 5,
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again.");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  private attach() {
    this.hostEl.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectInput = new ProjectInput();
const activeProjectsList = new ProjectList("active");
const finishedProjectsList = new ProjectList("finished");
