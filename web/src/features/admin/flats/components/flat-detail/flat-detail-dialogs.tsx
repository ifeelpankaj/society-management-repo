"use client";

import dynamic from "next/dynamic";
import type { FormEvent } from "react";

import type {
  ModelsFlatResidentRole,
  ModelsFlatStatus,
  ModelsSocietyMemberResponse,
} from "@/lib/api/generated-api";

const EditFlatDialog = dynamic(
  () =>
    import("./edit-flat-dialog").then((module) => ({
      default: module.EditFlatDialog,
    })),
  { ssr: false },
);

const AddResidentDialog = dynamic(
  () =>
    import("./add-resident-dialog").then((module) => ({
      default: module.AddResidentDialog,
    })),
  { ssr: false },
);

type FlatDetailDialogsProps = {
  addOpen: boolean;
  addPrimary: boolean;
  addRole: ModelsFlatResidentRole;
  editBlock: string;
  editFlatNumber: string;
  editFloor: string;
  editIsActive: string;
  editOpen: boolean;
  editStatus: ModelsFlatStatus;
  isAddingResident: boolean;
  isUpdating: boolean;
  memberSearch: string;
  members: ModelsSocietyMemberResponse[];
  membersQuery: { isFetching: boolean };
  onAddPrimaryChange: (value: boolean) => void;
  onAddResident: (
    event: FormEvent<HTMLFormElement>,
    input: {
      userId: number;
      role: ModelsFlatResidentRole;
      isPrimary: boolean;
    },
    onComplete?: () => void,
  ) => void;
  onAddRoleChange: (value: ModelsFlatResidentRole) => void;
  onEditBlockChange: (value: string) => void;
  onEditFlatNumberChange: (value: string) => void;
  onEditFloorChange: (value: string) => void;
  onEditIsActiveChange: (value: string) => void;
  onEditOpenChange: (open: boolean) => void;
  onEditStatusChange: (value: ModelsFlatStatus) => void;
  onMemberSearchChange: (value: string) => void;
  onSelectedUserIdChange: (value: string) => void;
  onUpdateFlat: (
    event: FormEvent<HTMLFormElement>,
    input: {
      flatNumber: string;
      block: string;
      floor: string;
      status: ModelsFlatStatus;
      isActive: boolean;
    },
    onComplete?: () => void,
  ) => void;
  selectedUserId: string;
  setAddOpen: (open: boolean) => void;
};

export function FlatDetailDialogs(props: FlatDetailDialogsProps) {
  const resetAddForm = () => {
    props.setAddOpen(false);
    props.onSelectedUserIdChange("");
    props.onMemberSearchChange("");
    props.onAddRoleChange("tenant");
    props.onAddPrimaryChange(false);
  };

  return (
    <>
      {props.editOpen ? (
        <EditFlatDialog
          block={props.editBlock}
          flatNumber={props.editFlatNumber}
          floor={props.editFloor}
          isActive={props.editIsActive}
          isUpdating={props.isUpdating}
          onBlockChange={props.onEditBlockChange}
          onFlatNumberChange={props.onEditFlatNumberChange}
          onFloorChange={props.onEditFloorChange}
          onIsActiveChange={props.onEditIsActiveChange}
          onOpenChange={props.onEditOpenChange}
          onStatusChange={props.onEditStatusChange}
          onSubmit={(event, values) =>
            props.onUpdateFlat(event, values, () =>
              props.onEditOpenChange(false),
            )
          }
          open={props.editOpen}
          status={props.editStatus}
        />
      ) : null}

      {props.addOpen ? (
        <AddResidentDialog
          addPrimary={props.addPrimary}
          addRole={props.addRole}
          isAddingResident={props.isAddingResident}
          memberSearch={props.memberSearch}
          members={props.members}
          membersQuery={props.membersQuery}
          onAddPrimaryChange={props.onAddPrimaryChange}
          onAddRoleChange={props.onAddRoleChange}
          onMemberSearchChange={props.onMemberSearchChange}
          onOpenChange={props.setAddOpen}
          onSelectedUserIdChange={props.onSelectedUserIdChange}
          onSubmit={(event, values) =>
            props.onAddResident(event, values, resetAddForm)
          }
          open={props.addOpen}
          selectedUserId={props.selectedUserId}
        />
      ) : null}
    </>
  );
}
