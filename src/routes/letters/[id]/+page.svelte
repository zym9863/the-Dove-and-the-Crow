<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { letterStore, ceremonyStore } from '$lib/stores/letterStore.js';
	import type { Letter, FarewellCeremony } from '$lib/types.js';
	import { ArrowLeft, Edit, Calendar, User, Feather, Waves } from 'lucide-svelte';

	let letter: Letter | null = null;
	let ceremony: FarewellCeremony | null = null;
	let isLoading = true;

	$: letterId = $page.params.id;

	onMount(async () => {
		if (letterId) {
			await loadLetter(letterId);
		}
	});

	async function loadLetter(id: string) {
		isLoading = true;
		try {
			letter = await letterStore.getLetter(id);
			if (letter) {
				// 如果是封存的信笺，加载仪式记录
				if (letter.status === 'sealed') {
					ceremony = await ceremonyStore.getCeremony(id);
				}
			}
		} catch (error) {
			console.error('加载信笺失败:', error);
		} finally {
			isLoading = false;
		}
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function goBack() {
		goto('/letters');
	}

	function editLetter() {
		if (letter) {
			goto(`/write/${letter.id}`);
		}
	}
</script>

<svelte:head>
	<title>{letter?.title || '信笺详情'} - 白鸽与乌鸦</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-dove-50 via-white to-crow-100">
	<!-- 顶部导航 -->
	<header class="bg-white/80 backdrop-blur-sm border-b border-dove-200">
		<div class="container mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<button 
					onclick={goBack}
					class="flex items-center text-crow-600 hover:text-crow-800 transition-colors"
				>
					<ArrowLeft class="w-5 h-5 mr-2" />
					返回列表
				</button>

				{#if letter && letter.status === 'active'}
					<button 
						onclick={editLetter}
						class="dove-button flex items-center"
					>
						<Edit class="w-4 h-4 mr-2" />
						编辑
					</button>
				{/if}
			</div>
		</div>
	</header>

	<!-- 信笺内容 -->
	<main class="container mx-auto px-6 py-8">
		{#if isLoading}
			<div class="text-center py-16">
				<div class="animate-spin w-8 h-8 border-2 border-dove-500 border-t-transparent rounded-full mx-auto mb-4"></div>
				<p class="text-crow-600">加载中...</p>
			</div>
		{:else if !letter}
			<div class="text-center py-16">
				<h2 class="text-2xl text-crow-600 mb-4">信笺不存在</h2>
				<p class="text-crow-500 mb-6">可能已被删除或链接有误</p>
				<button onclick={goBack} class="dove-button">返回列表</button>
			</div>
		{:else}
			<div class="max-w-4xl mx-auto">
				<!-- 信笺状态提示 -->
				{#if letter.status === 'sealed'}
					<div class="letter-paper p-4 mb-6 bg-amber-50/50 border-amber-200">
						<div class="flex items-center text-amber-700">
							<Feather class="w-5 h-5 mr-2" />
							<span class="font-medium">此信笺已被封存</span>
							{#if ceremony}
								<span class="ml-2 text-sm">
									- 于 {formatDate(ceremony.performedAt)} 放飞白鸽
								</span>
							{/if}
						</div>
						{#if ceremony?.message}
							<p class="mt-2 text-amber-600 italic">"{ceremony.message}"</p>
						{/if}
					</div>
				{/if}

				<!-- 信笺主体 -->
				<div class="letter-paper p-8">
					<!-- 信笺头部 -->
					<div class="mb-8">
						<h1 class="text-3xl font-serif text-crow-800 mb-4">{letter.title}</h1>
						<div class="flex flex-wrap items-center text-sm text-crow-500 space-x-6">
							<div class="flex items-center">
								<Calendar class="w-4 h-4 mr-1" />
								创建于 {formatDate(letter.createdAt)}
							</div>
							{#if letter.updatedAt.getTime() !== letter.createdAt.getTime()}
								<div class="flex items-center">
									<Calendar class="w-4 h-4 mr-1" />
									更新于 {formatDate(letter.updatedAt)}
								</div>
							{/if}
							{#if letter.recipient}
								<div class="flex items-center">
									<User class="w-4 h-4 mr-1" />
									收信人: {letter.recipient}
								</div>
							{/if}
						</div>
						<hr class="mt-6 border-dove-200" />
					</div>

					<!-- 信笺内容 -->
					<div class="mb-8">
						<div class="prose prose-lg max-w-none text-crow-700 leading-relaxed whitespace-pre-wrap">
							{letter.content}
						</div>
					</div>

					<!-- 信笺底部 -->
					<div class="text-right text-sm text-crow-500 border-t border-dove-200 pt-6">
						<p>此信笺包含 {letter.content.length} 个字符</p>
						{#if letter.tags && letter.tags.length > 0}
							<div class="mt-2">
								{#each letter.tags as tag}
									<span class="inline-block bg-dove-100 text-dove-700 px-2 py-1 rounded-full text-xs mr-2">
										#{tag}
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				<!-- 操作提示 -->
				{#if letter.status === 'active'}
					<div class="mt-6 text-center text-sm text-crow-500">
						<p>💡 你可以继续编辑这封信笺，或者选择告别仪式来结束它的使命</p>
					</div>
				{:else if letter.status === 'sealed'}
					<div class="mt-6 text-center text-sm text-crow-500">
						<p>🕊️ 白鸽已经飞走，这封信笺的故事已经结束，但回忆永远保存</p>
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>
