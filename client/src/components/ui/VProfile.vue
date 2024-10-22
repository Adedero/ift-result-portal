<script setup>
import { nextTick, ref, watch } from 'vue';
import useUserStore from '../../stores/user.store';
import useFetch from '../../composables/fetch/use-fetch';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import titles from '../../data/titles';
import classes from '../../data/classes';
const props = defineProps({
  role: {
    type: String,
    default: "student"
  },
  user: {
    type: Object,
    required: true,
    default: {}
  }
});

const router = useRouter();
const toast = useToast();
const userStore = useUserStore();

const profile = ref({ ...props.user });

const isFileSelected = ref(false);
const cancelUpload = ref(false);
const handleCancel = () => {
  window.location.reload()
}
//Handle profile picture change
const handleUpload = async (file) => {
  profile.value.changingImage = true;
  const form = new FormData();
  form.append("file", file[0]);
  await useFetch(
    `${props.role}/change-image/${profile.value._id}`,
    { method: "POST", router, toast, body: form, toastOnFailure: true },
    (payload) => {
      profile.value.image = payload.image;
      userStore.setUser(profile.value._id, { image: payload.image });
      window.location.reload();
    }
  )
  profile.value.changingImage = false;
}
//Remove image
const removing = ref(false);
const handleRemove = async () => {
  removing.value = true;
  await useFetch(
    `${props.role}/remove-image/${profile.value._id}`,
    { method: "PUT", router, toast, toastOnFailure: true },
    () => {
      profile.value.image = "";
      userStore.setUser(profile.value._id, { image: "" });
    }
  )
  removing.value = false;
}

const updatePersonalDetails = async () => {
  profile.value.loading_1 = true;
  await useFetch(
    `${props.role}/update-personal-details/${profile.value._id}`,
    { method: "PUT", router, toast, body: profile.value, toastOnFailure: true, toastOnSuccess: true },
    (payload) => {
      userStore.setUser(profile.value._id, payload.user);
    }
  )
  profile.value.loading_1 = false;
}

const updateAcademicDetails = async () => {
  profile.value.loading_2 = true;
  await useFetch(
    `${props.role}/update-academic-details/${profile.value._id}`,
    { method: "PUT", router, toast, body: profile.value, toastOnFailure: true, toastOnSuccess: true },
    (payload) => {
      userStore.setUser(profile.value._id, payload.user);
    }
  )
  profile.value.loading_2 = false;
}

const updateAccountDetails = async () => {
  profile.value.loading_3 = true;
  await useFetch(
    `${props.role}/update-account-details/${profile.value._id}`,
    { method: "PUT", router, toast, body: profile.value, toastOnFailure: true, toastOnSuccess: true },
    (payload) => {
      userStore.setUser(profile.value._id, payload.user);
    }
  )
  profile.value.loading_3 = false;
}
</script>

<template>
  <section class="w-full grid items-start gap-5 md:gap-2 md:grid-cols-3">
    <div class="flex flex-col items-center gap-4 justify-center md:col-span-1">
      <div class="rounded-full overflow-hidden w-40 h-40">
        <VAvatar :user="profile" size="xlarge" class="text-5xl w-40 h-40 rounded-full" />
      </div>

      <div class="text-center grid">
        <p class="text-sm font-medium text-slate-500 mb-1">Change profile picture</p>
        <VFileUploader :loading="profile.changingImage"
          @select="isFileSelected = true" @cancel="isFileSelected = false"
          @upload="handleUpload" accept=".png,.jpg,.jpeg,.bmp,"
          :max-file-size="2 * 1024 * 1024" :cancelUpload />

          <div v-if="profile.image" class="mt-2">
            <Button @click="handleRemove" severity="danger" :loading="removing" outlined label="Remove" />
          </div>

          <div v-if="isFileSelected" class="mt-2">
            <Button @click="handleCancel" severity="danger" outlined label="Cancel" />
          </div>
      </div>
      <Divider />
      <div>
        <PasswordChanger :role :user="profile" />
      </div>

    </div>

    <div class="md:col-span-2 flex flex-col gap-4 *:flex-shrink-0 md:h-full md:overflow-y-auto">
      <Card>
        <template #title>Personal Details</template>
        <template #content>
          <div :class="['grid gap-2', profile.role !== 'STUDENT' ? 'md:grid-cols-3' : 'md:grid-cols-2']">
            <Select v-if="profile.role !== 'STUDENT'" v-model="profile.title" :options="titles" placeholder="Title"
              fluid />
            <InputText v-model.trim="profile.firstName" placeholder="First Name" fluid />
            <InputText v-model.trim="profile.lastName" placeholder="Last Name" fluid />
            <Select v-model="profile.sex" :options="['FEMALE', 'MALE']" placeholder="Sex" fluid />
            <Button label="save" icon="pi pi-check-circle" @click="updatePersonalDetails"
              :disabled="!profile.firstName || !profile.lastName || !profile.sex || profile.loading_1"
              :loading="profile.loading_1" />
          </div>
        </template>
      </Card>

      <Card>
        <template #title>Academic Details</template>
        <template #content>
          <div class="grid gap-2 md:grid-cols-2">
            <InputText v-if="profile.role === 'STUDENT'" v-model="profile.regNumber" placeholder="Reg. Number" disabled
              fluid />
            <Select v-if="profile.role === 'STUDENT'" v-model="profile.level"
              :options="[100, 200, 300, 400, 500, 600, 700]" placeholder="Level" fluid />

            <InputText v-if="profile.role !== 'STUDENT'" v-model.trim="profile.staffId"
              placeholder="Staff ID"
              :disabled="profile.role !== 'ADMIN'"
              fluid />
            <Select v-if="profile.role !== 'STUDENT'" v-model="profile.studentClass" :options="['', ...classes]"
              placeholder="Student Class" fluid />

            <Button label="save" icon="pi pi-check-circle" @click="updateAcademicDetails"
              :loading="profile.loading_2" />
          </div>
        </template>
      </Card>

      <Card>
        <template #title>Account Details</template>
        <template #content>
          <div class="grid gap-2 md:grid-cols-2">
            <InputText v-model.trim="profile.email" placeholder="Email" class="md:col-span-2" fluid />
            <InputText v-model.trim="profile.username" placeholder="Username" fluid />
            <Button label="save" icon="pi pi-check-circle" @click="updateAccountDetails" :loading="profile.loading_3" />
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>