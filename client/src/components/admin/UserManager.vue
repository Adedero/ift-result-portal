<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import useFetch from '../../composables/fetch/use-fetch';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import useUserStore from '../../stores/user.store';

const props = defineProps({
  userRole: { type: String, default: "STUDENT" }
});

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const userStore = useUserStore();

const loading = ref(false);
const error = ref(null);
const users = ref(null);
const page = ref(0);
const LIMIT = 50;
const totalUsers = ref(0);

const getUsers = async (role, pageNumber) => {
  loading.value = true;
  error.value = null;
  const { error: err } = await useFetch(`admin/users/${role}?page=${pageNumber}&limit=${LIMIT}`,
    { router, toast, cache: true },
    (payload) => {
      if (props.userRole === "ADMIN") {
        users.value = payload.filter(user => user._id !== userStore.user.id) 
      } else {
        users.value = payload;
      }
    }
  )
  loading.value = false;
  error.value = err.value;
}

const search = ref("");
const filteredUsers = computed(() => {
  if (users.value) {
    return users.value
      .filter(user => (
        (user.firstName && user.firstName.toLowerCase().includes(search.value.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(search.value.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.value.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(search.value.toLowerCase())) ||
        (user.staffId && user.staffId.toLowerCase().includes(search.value.toLowerCase())) ||
        (user.regNumber && user.regNumber.toLowerCase().includes(search.value.toLowerCase()))
      )
      );
  }
  return []
});


const getUserCount = async (role) => {
  await useFetch(`admin/users-count/${role}`,
    {
      router, toast,
      cache: true,
      toastOnFailure: true,
      toastLife: 8000,
      failureSummary: "Network error",
      failureDetail: "Failed to load critical data. Please, relaod the page."
    },
    (payload) => {
      totalUsers.value = payload.count;
    }
  )
}

watch(page, async (newValue) => {
  await getUsers(props.userRole, newValue)
});


const totalPages = computed(() => Math.ceil(totalUsers.value / LIMIT))
const lowerBound = computed(() => page.value * LIMIT + 1)
const upperBound = computed(() => Math.min((page.value + 1) * LIMIT, totalUsers.value))

//Adding a new user
const visible = ref(false);
const handleUserAdd = (newUser) => {
  if (users.value) {
    users.value.unshift(newUser);
    visible.value = false;
  }
}

//Selecting users
const areAnyUsersSelected = computed(() => users.value ? users.value.some(user => user.checked) : false);
const allSelected = ref(false);

watch(allSelected, (value) => {
  if (value) {
    users.value.forEach(user => user.checked = true)
  } else {
    users.value.forEach(user => user.checked = false)
  }
});

const selectedUsers = computed(() => users.value ? users.value.filter(user => user.checked) : []);

//Deleting users
const isDeleting = ref(false);
const deleteUsers = async () => {
  isDeleting.value = true;
  await useFetch(
    `admin/delete-users/${props.userRole}`,
    { method: "POST", router, toast, toastOnFailure: true, toastLife: 8000, body: selectedUsers.value },
    (payload) => {
      if (payload.success) {
        const removedUserIds = selectedUsers.value.map(user => user._id);
        users.value = [
          ...users.value.filter(user => !removedUserIds.includes(user._id)),
        ];
      }
    }
  )
  isDeleting.value = false;
}

const confirmDelete = () => {
  const roleName = props.userRole.toLowerCase().trim();
  confirm.require({
    message: `Are you sure you want to delete ${selectedUsers.value.length} ${selectedUsers.value.length === 1 ? roleName : `${roleName}s`}?`,
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: () => {
      deleteUsers()
    }
  })
}

//Updating user
const isUpdating = ref(false);
const userToUpdate = ref(null);
const openUpdateDialog = (user) => {
  userToUpdate.value = user;
  isUpdating.value = true;
}

const onHide = () => {
  userToUpdate.value = null;
  isUpdating.value = false;
}

const updateUser = (user) => {
  if (users.value) {
    const updatedUsers = users.value.map(u => {
      if (u._id === user._id) {
        return user;
      }
      return u;
    });
    users.value = updatedUsers;
  }
}

const updateEditedUser = (user) => {
  if (users.value) {
    const updatedUsers = users.value.map(u => {
      if (u._id === user._id) {
        return user;
      }
      return u;
    });
    users.value = updatedUsers;
  }
  onHide();
}


onMounted(async () => {
  await Promise.all([
    getUsers(props.userRole, page.value),
    getUserCount(props.userRole)
  ])
});

</script>

<template>
  <section class="h-full overflow-y-auto">
    <header class="bg-white border-y px-5 py-2 flex items-center gap-2 justify-between flex-wrap">
      <div class="flex items-center gap-3 justify-between">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 transition-all">
            <CheckBox v-model="allSelected" :binary="true" />
            <Button @click="confirmDelete" v-show="areAnyUsersSelected" size="small" icon="pi pi-trash"
              severity="danger" text :loading="isDeleting" />
          </div>
          <p class="font-semibold">
            {{ selectedUsers.length ? `${selectedUsers.length}/` : "" }}{{ filteredUsers.length }}
          </p>
          <p class="font-semibold">
            {{ `${userRole === 'ADMIN' ? 'Other ': ''}${userRole[0]}${userRole.toLowerCase().slice(1, userRole.length)}${users ? users.length === 1 ? '' : 's'
            : ''}` }}
          </p>
        </div>

        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="search" placeholder="Search" fluid class="h-8 text-sm" />
        </IconField>
      </div>

      <div>
        <Button @click="page--" text severity="secondary" size="small" rounded icon="pi pi-chevron-left"
          :disabled="page < 1" />
        <span class="text-sm">{{ lowerBound }} - {{ upperBound }} of {{ totalUsers }}</span>
        <Button @click="page++" text severity="secondary" size="small" rounded icon="pi pi-chevron-right"
          :disabled="page + 1 >= totalPages" />
      </div>

      <Button @click="visible = true" label="Add" icon="pi pi-plus" size="small" />
      <Dialog v-model:visible="visible" modal
        :header="'Add' + ' ' + `${userRole[0]}${userRole.toLowerCase().slice(1, userRole.length)}`">
        <AddUser :role="userRole" @add-user="handleUserAdd" />
      </Dialog>
    </header>

    <div class="max-h-[calc(100%-4rem)] overflow-y-auto">
      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerError :error @retry="getUsers(userRole, page)" />
      </section>

      <section v-else-if="users" class="h-full px-2 pb-5 md:px-5 grid gap-4">
        <Dialog v-model:visible="isUpdating" @hide="onHide" modal
          :header="`Edit ${userToUpdate ? userToUpdate.firstName + ' ' + userToUpdate.lastName : 'User'}`">
          <UpdateUser :updated-user="userToUpdate" @update="updateEditedUser" />
        </Dialog>

        <div class="h-full">
          <table class="table-auto w-full whitespace-nowrap md:whitespace-normal">
            <thead class="text-left sticky top-0 bg-slate-100 text-sm">
              <tr class="*:p-1">
                <th></th>
                <th></th>
                <th v-if="userRole !== 'STUDENT'">Title</th>
                <th>Name</th>
                <th>Sex</th>
                <th v-if="userRole !== 'STUDENT'">Staff ID</th>
                <th v-if="userRole !== 'STUDENT'">Class</th>

                <th v-if="userRole === 'STUDENT'">Reg. Number</th>
                <th v-if="userRole === 'STUDENT'">Level</th>

                <th>Username</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="user in filteredUsers" :key="user._id"
                class="group border-b *:p-2 hover:bg-slate-200 transition-colors duration-100 cursor-pointer"
                :class="{ 'bg-slate-200': user.checked }">
                <td>
                  <Checkbox v-model="user.checked" @click="updateUser(user)" :binary="true" />
                </td>
                <td>
                  <VAvatar :user="user" class="w-10 h-10 bg-[--p-primary-200]" />
                </td>
                <td v-if="userRole !== 'STUDENT'">{{ user.title }}</td>
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.sex }}</td>
                <td v-if="userRole !== 'STUDENT'">{{ user.staffId }}</td>
                <td v-if="userRole !== 'STUDENT'">{{ user.studentClass }}</td>

                <td v-if="userRole === 'STUDENT'">{{ user.regNumber }}</td>
                <td v-if="userRole === 'STUDENT'">{{ user.level }}</td>

                <td>{{ user.username ?? "" }}</td>
                <td>{{ user.email ?? "" }}</td>
                <td>
                  <Button @click="openUpdateDialog(user)" icon="pi pi-user-edit" rounded />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

  </section>
</template>
