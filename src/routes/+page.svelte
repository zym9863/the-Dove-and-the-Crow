<script lang="ts">
	import { onMount } from 'svelte';
	import { letterStore, letters, activeLetters, sealedLetters } from '$lib/stores/letterStore.js';
	import { Feather, BookOpen, Archive, PenTool } from 'lucide-svelte';

	let letterCount = 0;
	let activeCount = 0;
	let sealedCount = 0;

	onMount(async () => {
		await letterStore.loadLetters();
	});

	// 响应式更新计数
	$: letterCount = $letters.length;
	$: activeCount = $activeLetters.length;
	$: sealedCount = $sealedLetters.length;
</script>

<svelte:head>
	<title>白鸽与乌鸦 - 无声信笺</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-dove-50 via-white to-crow-100">
	<!-- 头部区域 -->
	<header class="relative overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-r from-dove-500/10 to-crow-500/10"></div>
		<div class="relative container mx-auto px-6 py-16 text-center">
			<div class="flex justify-center items-center mb-6">
				<Feather class="w-12 h-12 text-dove-600 mr-4 animate-float" />
				<h1 class="text-4xl md:text-6xl font-serif text-crow-800 animate-fade-in">
					白鸽与乌鸦
				</h1>
				<Feather class="w-12 h-12 text-crow-600 ml-4 transform scale-x-[-1] animate-float" style="animation-delay: 0.5s;" />
			</div>
			<p class="text-xl text-crow-600 font-light max-w-2xl mx-auto leading-relaxed">
				那些无法寄出的信笺，那些无法言说的话语<br>
				在这里，它们找到了归宿
			</p>
		</div>
	</header>

	<!-- 主要内容区域 -->
	<main class="container mx-auto px-6 py-12">
		<!-- 统计卡片 -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
			<div class="letter-paper p-6 text-center animate-slide-up" style="animation-delay: 0.1s;">
				<BookOpen class="w-8 h-8 text-dove-600 mx-auto mb-3 animate-pulse-glow" />
				<h3 class="text-lg font-medium text-crow-700 mb-1">总信笺</h3>
				<p class="text-3xl font-bold text-crow-800">{letterCount}</p>
			</div>
			<div class="letter-paper p-6 text-center animate-slide-up" style="animation-delay: 0.2s;">
				<PenTool class="w-8 h-8 text-blue-600 mx-auto mb-3 animate-pulse-glow" />
				<h3 class="text-lg font-medium text-crow-700 mb-1">活跃信笺</h3>
				<p class="text-3xl font-bold text-blue-700">{activeCount}</p>
			</div>
			<div class="letter-paper p-6 text-center animate-slide-up" style="animation-delay: 0.3s;">
				<Archive class="w-8 h-8 text-amber-600 mx-auto mb-3 animate-pulse-glow" />
				<h3 class="text-lg font-medium text-crow-700 mb-1">封存信笺</h3>
				<p class="text-3xl font-bold text-amber-700">{sealedCount}</p>
			</div>
		</div>

		<!-- 功能导航 -->
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
			<!-- 写信功能 -->
			<a href="/write" class="group letter-paper p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
				<div class="flex items-center mb-4">
					<div class="w-12 h-12 bg-dove-500 rounded-full flex items-center justify-center mr-4 group-hover:bg-dove-600 transition-colors">
						<PenTool class="w-6 h-6 text-white" />
					</div>
					<h2 class="text-2xl font-serif text-crow-800">无声信笺</h2>
				</div>
				<p class="text-crow-600 leading-relaxed mb-4">
					在这个私密的写作空间里，记录那些无法寄出、无法言说的话语和情感。
					这里是你的心灵避风港，没有评判，只有倾听。
				</p>
				<div class="text-dove-600 font-medium group-hover:text-dove-700 transition-colors">
					开始写信 →
				</div>
			</a>

			<!-- 信笺管理功能 -->
			<a href="/letters" class="group letter-paper p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
				<div class="flex items-center mb-4">
					<div class="w-12 h-12 bg-crow-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-crow-700 transition-colors">
						<BookOpen class="w-6 h-6 text-white" />
					</div>
					<h2 class="text-2xl font-serif text-crow-800">信笺管理</h2>
				</div>
				<p class="text-crow-600 leading-relaxed mb-4">
					查看和管理你的所有信笺。当你准备好告别时，
					可以选择"放飞白鸽"封存回忆，或"沉入深海"彻底释怀。
				</p>
				<div class="text-crow-600 font-medium group-hover:text-crow-700 transition-colors">
					管理信笺 →
				</div>
			</a>
		</div>

		<!-- 诗意引言 -->
		<div class="text-center mt-16 max-w-2xl mx-auto">
			<blockquote class="text-lg text-crow-600 font-light italic leading-relaxed">
				"迟来的阳光救不了枯萎的花，<br>
				和我告别吧..."
			</blockquote>
			<p class="text-sm text-crow-400 mt-4">
				— 有些话，只能对自己说
			</p>
		</div>
	</main>
</div>
