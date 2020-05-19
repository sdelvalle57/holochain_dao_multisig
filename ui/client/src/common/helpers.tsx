import { ADD_NEW_MEMBER, CHANGE_REQUIREMENTS, REMOVE_MEMBER } from "./constants"

export const getMethodName = (method: string): string  => {
    switch(method) {
        case "add_member": return ADD_NEW_MEMBER;
        case "change_requirement": return CHANGE_REQUIREMENTS
        case "remove_member": return REMOVE_MEMBER
        default: return method;
    }
}