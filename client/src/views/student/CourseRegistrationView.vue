<script setup>
import useFetch from '@/composables/fetch/use-fetch';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const router = useRouter();
const toast = useToast();

const { error, data } = await useFetch("student/course-registration", { cache: true, router, toast });
</script>

<template>
  <section class="h-full overflow-y-auto">
    <header class="bg-white border-y px-5 py-2 flex items-center justify-between gap-4 flex-wrap">
      <p class="font-semibold">Course Registration</p>
      <RouterLink :to="{ name: 'register-courses' }">
        <Button size="small" label="Register Courses" icon="pi pi-plus" />
      </RouterLink>
    </header>

    <div class="max-h-[calc(100%-4rem)] overflow-y-auto">
      <section v-if="error" class="h-72 px-2 pb-5 md:px-5 grid w-full place-content-center">
        <ServerErro :error reloadOnRetry />
      </section>

      <section v-else-if="data" class="h-full pb-5">
        <Accordion value="" mutliple>
          <AccordionPanel v-for="record, index in data.courseRegistrations" :key="record._id" :value="index.toString()">
            <AccordionHeader>{{ record.session }} : {{ record.semester }}</AccordionHeader>
            <AccordionContent>
              <ul class="list-inside grid gap-1">
                <li v-for="course in record.courses" :key="course.code">
                  <span class="font-medium">{{ course.code }}</span> : {{ course.title }}
                  <Divider />
                </li>
              </ul>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </section>
    </div>

  </section>
</template>